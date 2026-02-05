import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { PaginationOptions } from "convex/server";

const taskStatus = v.union(
  v.literal("inbox"),
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("done"),
  v.literal("blocked")
);

const taskPriority = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent")
);

const squad = v.union(v.literal("oceans-11"), v.literal("dune"));

function normalizePagination(opts?: PaginationOptions): PaginationOptions {
  const base = opts ?? { numItems: 50, cursor: null };
  return { ...base, numItems: Math.min(base.numItems ?? 50, 100) };
}

// Simple list query (returns array)
export const list = query({
  args: {
    status: v.optional(taskStatus),
    squad: v.optional(squad),
  },
  handler: async (ctx, args) => {
    if (args.squad && args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_squad_status", (q) =>
          q.eq("squad", args.squad!).eq("status", args.status!)
        )
        .take(100);
    }
    if (args.squad) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_squad", (q) => q.eq("squad", args.squad!))
        .take(100);
    }
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(100);
    }
    return await ctx.db.query("tasks").take(100);
  },
});

// Paginated list query
export const listPaginated = query({
  args: {
    status: v.optional(taskStatus),
    squad: v.optional(squad),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginationOpts = normalizePagination(args.paginationOpts as any);
    if (args.squad && args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_squad_status", (q) =>
          q.eq("squad", args.squad!).eq("status", args.status!)
        )
        .paginate(paginationOpts);
    }
    if (args.squad) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_squad", (q) => q.eq("squad", args.squad!))
        .paginate(paginationOpts);
    }
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .paginate(paginationOpts);
    }
    return await ctx.db.query("tasks").paginate(paginationOpts);
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const attention = query({
  args: {},
  handler: async (ctx) => {
    const review = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "review"))
      .take(50);
    const blocked = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "blocked"))
      .take(50);
    return [...review, ...blocked];
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: taskStatus,
    priority: taskPriority,
    squad: squad,
    assigneeIds: v.array(v.id("agents")),
    createdBy: v.string(),
    dueDate: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: taskStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const archive = mutation({
  args: {
    id: v.id("tasks"),
    archivedBy: v.optional(v.id("agents")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
      archivedBy: args.archivedBy,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
