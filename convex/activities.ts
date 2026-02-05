import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { PaginationOptions } from "convex/server";

const squad = v.union(v.literal("oceans-11"), v.literal("dune"));

function normalizePagination(opts?: PaginationOptions): PaginationOptions {
  const base = opts ?? { numItems: 50, cursor: null };
  return {
    ...base,
    numItems: Math.min(base.numItems ?? 50, 100),
  };
}

// Simple limit-based list for backward compatibility
export const list = query({
  args: {
    limit: v.optional(v.number()),
    squad: v.optional(squad),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);

    const q = args.squad
      ? ctx.db
          .query("activities")
          .withIndex("by_squad", (q) => q.eq("squad", args.squad!))
      : ctx.db.query("activities");

    const results = await q.order("desc").take(limit);

    // Enrich with agent names for old rows missing denormalized data
    const missing = results.filter((a) => !a.agentName);
    if (missing.length === 0) return results;

    const agentIds = [...new Set(missing.map((a) => a.agentId))];
    const agents = await Promise.all(agentIds.map((id) => ctx.db.get(id)));
    const agentMap = new Map(agents.filter(Boolean).map((a) => [a!._id, a!]));

    return results.map((a) => {
      if (a.agentName) return a;
      const agent = agentMap.get(a.agentId);
      return {
        ...a,
        agentName: agent?.name ?? "System",
        agentRole: agent?.role,
      };
    });
  },
});

// Cursor-based paginated feed for infinite scroll
export const paginated = query({
  args: {
    squad: v.optional(squad),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginationOpts = normalizePagination(args.paginationOpts as any);

    const q = args.squad
      ? ctx.db
          .query("activities")
          .withIndex("by_squad", (q) => q.eq("squad", args.squad!))
      : ctx.db.query("activities");

    const results = await q.order("desc").paginate(paginationOpts);

    // We store denormalized agentName on write. Keep a best-effort fallback for old rows.
    const missing = results.page.filter((a) => !a.agentName);
    if (missing.length === 0) return results;

    const agentIds = [...new Set(missing.map((a) => a.agentId))];
    const agents = await Promise.all(agentIds.map((id) => ctx.db.get(id)));
    const agentMap = new Map(agents.filter(Boolean).map((a) => [a!._id, a!]));

    return {
      ...results,
      page: results.page.map((a) => {
        if (a.agentName) return a;
        const agent = agentMap.get(a.agentId);
        return {
          ...a,
          agentName: agent?.name ?? "System",
          agentRole: agent?.role,
        };
      }),
    };
  },
});

export const byAgent = query({
  args: {
    agentId: v.id("agents"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginationOpts = normalizePagination(args.paginationOpts as any);
    return await ctx.db
      .query("activities")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const byTask = query({
  args: {
    taskId: v.id("tasks"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginationOpts = normalizePagination(args.paginationOpts as any);
    return await ctx.db
      .query("activities")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Prefer writing denormalized agentName/agentRole + required squad for isolation.
export const create = mutation({
  args: {
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    squad,
    action: v.string(),
    details: v.optional(v.any()),
  },
  returns: v.id("activities"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const agent = await ctx.db.get(args.agentId);

    return await ctx.db.insert("activities", {
      agentId: args.agentId,
      taskId: args.taskId,
      squad: args.squad,
      action: args.action,
      details: args.details,
      createdAt: now,
      agentName: agent?.name,
      agentRole: agent?.role,
    });
  },
});
