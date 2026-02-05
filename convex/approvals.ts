import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Approval queries
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    let approvals;
    if (args.status) {
      approvals = await ctx.db
        .query("approvals")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    } else {
      approvals = await ctx.db
        .query("approvals")
        .order("desc")
        .take(limit);
    }
    
    // Enrich with agent names and task details
    const enriched = await Promise.all(
      approvals.map(async (approval) => {
        const agent = approval.requestedByAgentId 
          ? await ctx.db.get(approval.requestedByAgentId)
          : null;
        const task = approval.relatedTaskId
          ? await ctx.db.get(approval.relatedTaskId)
          : null;
        return {
          ...approval,
          requestedByName: agent?.name || 'System',
          taskTitle: task?.title || null,
        };
      })
    );
    
    return enriched;
  }
});

export const get = query({
  args: { id: v.id("approvals") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const approval = await ctx.db.get(args.id);
    if (!approval) return null;
    
    const agent = approval.requestedByAgentId 
      ? await ctx.db.get(approval.requestedByAgentId)
      : null;
    const task = approval.relatedTaskId
      ? await ctx.db.get(approval.relatedTaskId)
      : null;
    
    return {
      ...approval,
      requestedByName: agent?.name || 'System',
      taskTitle: task?.title || null,
    };
  }
});

export const stats = query({
  args: {},
  returns: v.object({
    pending: v.number(),
    approved: v.number(),
    rejected: v.number(),
    total: v.number(),
  }),
  handler: async (ctx) => {
    const all = await ctx.db.query("approvals").collect();
    return {
      pending: all.filter(a => a.status === 'pending').length,
      approved: all.filter(a => a.status === 'approved').length,
      rejected: all.filter(a => a.status === 'rejected').length,
      total: all.length,
    };
  }
});

// Approval mutations
export const create = mutation({
  args: {
    actionType: v.string(),
    payload: v.any(),
    requestedByAgentId: v.optional(v.id("agents")),
    relatedTaskId: v.optional(v.id("tasks")),
  },
  returns: v.id("approvals"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("approvals", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  }
});

export const decide = mutation({
  args: {
    id: v.id("approvals"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    decidedBy: v.string(),
    decisionNote: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const approval = await ctx.db.get(args.id);
    if (!approval) throw new Error("Approval not found");
    if (approval.status !== "pending") throw new Error("Approval already decided");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: args.decision,
      decidedBy: args.decidedBy,
      decisionNote: args.decisionNote,
      updatedAt: now,
    });

    // Log activity if we have a requester agent
    if (approval.requestedByAgentId) {
      await ctx.db.insert("activities", {
        agentId: approval.requestedByAgentId,
        taskId: approval.relatedTaskId,
        action: `approval_${args.decision}`,
        details: {
          approvalId: approval._id,
          actionType: approval.actionType,
          decidedBy: args.decidedBy,
        },
      });
    }
  }
});
