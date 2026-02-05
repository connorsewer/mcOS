import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { PaginationOptions } from "convex/server";

const squad = v.union(v.literal("oceans-11"), v.literal("dune"));

function normalizePagination(opts?: PaginationOptions): PaginationOptions {
  const base = opts ?? { numItems: 50, cursor: null };
  return { ...base, numItems: Math.min(base.numItems ?? 50, 100) };
}

export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const agent = await ctx.db
    .query("agents")
    .withIndex("by_sessionKey", (q) => q.eq("sessionKey", "system"))
    .first();
  if (agent) return agent;
  const leadAgent = await ctx.db.query("agents").first();
  return leadAgent;
}

// Simple list query (returns array)
export const list = query({
  args: {
    squad: v.optional(squad),
  },
  handler: async (ctx, args) => {
    if (args.squad) {
      return await ctx.db
        .query("agents")
        .withIndex("by_squad", (q) => q.eq("squad", args.squad!))
        .take(100);
    }
    return await ctx.db.query("agents").take(100);
  },
});

// Paginated list query
export const listPaginated = query({
  args: {
    squad: v.optional(squad),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginationOpts = normalizePagination(args.paginationOpts as any);
    if (args.squad) {
      return await ctx.db
        .query("agents")
        .withIndex("by_squad", (q) => q.eq("squad", args.squad!))
        .paginate(paginationOpts);
    }
    return await ctx.db.query("agents").paginate(paginationOpts);
  },
});

export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const bySessionKey = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    squad: squad,
    sessionKey: v.string(),
    level: v.union(v.literal("intern"), v.literal("specialist"), v.literal("lead")),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
  },
  returns: v.id("agents"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      lastHeartbeat: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      currentTaskId: args.currentTaskId,
      lastHeartbeat: Date.now(),
    });
  },
});

export const heartbeat = mutation({
  args: { id: v.id("agents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastHeartbeat: Date.now() });
  },
});
