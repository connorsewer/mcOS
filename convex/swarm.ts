import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query recent swarm activity for the Live panel
export const list = query({
  args: {
    limit: v.optional(v.number()),
    activityType: v.optional(v.union(
      v.literal("state_update"),
      v.literal("worker_spawned"),
      v.literal("task_completed"),
      v.literal("approval_requested"),
      v.literal("approval_executed"),
      v.literal("error"),
      v.literal("info")
    )),
    squad: v.optional(v.union(v.literal("oceans-11"), v.literal("dune"))),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    let activities;
    if (args.squad) {
      activities = await ctx.db
        .query("swarmActivity")
        .withIndex("by_squad", (q) => q.eq("squad", args.squad!))
        .order("desc")
        .take(limit);
    } else if (args.activityType) {
      activities = await ctx.db
        .query("swarmActivity")
        .withIndex("by_type", (q) => q.eq("activityType", args.activityType!))
        .order("desc")
        .take(limit);
    } else {
      activities = await ctx.db
        .query("swarmActivity")
        .order("desc")
        .take(limit);
    }
    
    // Enrich with agent names
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const agent = activity.agentId 
          ? await ctx.db.get(activity.agentId)
          : null;
        return {
          ...activity,
          agentName: agent?.name || null,
          agentRole: agent?.role || null,
        };
      })
    );
    
    return enriched;
  }
});

// Get single activity item
export const get = query({
  args: { id: v.id("swarmActivity") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.id);
    if (!activity) return null;
    
    const agent = activity.agentId 
      ? await ctx.db.get(activity.agentId)
      : null;
    
    return {
      ...activity,
      agentName: agent?.name || null,
      agentRole: agent?.role || null,
    };
  }
});

// Publish swarm state snapshot (replaces Supabase publisher)
export const publishState = mutation({
  args: {
    source: v.string(),
    payload: v.any(),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    squad: v.optional(v.union(v.literal("oceans-11"), v.literal("dune"))),
  },
  returns: v.id("swarmActivity"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("swarmActivity", {
      source: args.source,
      activityType: "state_update",
      payload: args.payload,
      createdAt: now,
      agentId: args.agentId,
      taskId: args.taskId,
      squad: args.squad,
    });
  }
});

// Log a worker spawned event
export const logWorkerSpawned = mutation({
  args: {
    workerType: v.string(),
    model: v.string(),
    taskId: v.optional(v.id("tasks")),
    squad: v.optional(v.union(v.literal("oceans-11"), v.literal("dune"))),
    payload: v.optional(v.any()),
  },
  returns: v.id("swarmActivity"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("swarmActivity", {
      source: "conductor",
      activityType: "worker_spawned",
      payload: {
        workerType: args.workerType,
        model: args.model,
        ...args.payload,
      },
      createdAt: now,
      taskId: args.taskId,
      squad: args.squad,
    });
  }
});

// Log task completion
export const logTaskCompleted = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    squad: v.union(v.literal("oceans-11"), v.literal("dune")),
    result: v.optional(v.any()),
  },
  returns: v.id("swarmActivity"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("swarmActivity", {
      source: "system",
      activityType: "task_completed",
      payload: args.result,
      createdAt: now,
      agentId: args.agentId,
      taskId: args.taskId,
      squad: args.squad,
    });
  }
});

// Log error
export const logError = mutation({
  args: {
    error: v.string(),
    source: v.string(),
    payload: v.optional(v.any()),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
  },
  returns: v.id("swarmActivity"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("swarmActivity", {
      source: args.source,
      activityType: "error",
      payload: {
        error: args.error,
        ...args.payload,
      },
      createdAt: now,
      agentId: args.agentId,
      taskId: args.taskId,
    });
  }
});

// Log info/event
export const logInfo = mutation({
  args: {
    message: v.string(),
    source: v.string(),
    payload: v.optional(v.any()),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    squad: v.optional(v.union(v.literal("oceans-11"), v.literal("dune"))),
  },
  returns: v.id("swarmActivity"),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("swarmActivity", {
      source: args.source,
      activityType: "info",
      payload: {
        message: args.message,
        ...args.payload,
      },
      createdAt: now,
      agentId: args.agentId,
      taskId: args.taskId,
      squad: args.squad,
    });
  }
});

// Cleanup old activity (keep last N days)
export const cleanup = mutation({
  args: {
    olderThanDays: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldActivities = await ctx.db
      .query("swarmActivity")
      .withIndex("by_created", (q) => q.lt("createdAt", cutoff))
      .collect();
    
    let deleted = 0;
    for (const activity of oldActivities) {
      await ctx.db.delete(activity._id);
      deleted++;
    }
    
    return deleted;
  }
});

// Get stats for the live dashboard
export const stats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    today: v.number(),
    errors: v.number(),
    workersSpawned: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const todayStart = now - (24 * 60 * 60 * 1000);
    
    const all = await ctx.db.query("swarmActivity").collect();
    
    return {
      total: all.length,
      today: all.filter(a => a.createdAt >= todayStart).length,
      errors: all.filter(a => a.activityType === "error").length,
      workersSpawned: all.filter(a => a.activityType === "worker_spawned").length,
    };
  }
});