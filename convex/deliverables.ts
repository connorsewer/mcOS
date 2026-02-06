import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUser } from "./agents";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List deliverables with optional filters
 */
export const list = query({
  args: {
    squad: v.optional(v.union(v.literal('oceans-11'), v.literal('dune'))),
    status: v.optional(v.union(v.literal('draft'), v.literal('review'), v.literal('approved'), v.literal('published'), v.literal('archived'))),
    type: v.optional(v.union(
      v.literal('research'),
      v.literal('blog_draft'),
      v.literal('email_copy'),
      v.literal('white_paper'),
      v.literal('presentation'),
      v.literal('image'),
      v.literal('spreadsheet'),
      v.literal('brief'),
      v.literal('other')
    )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { squad, status, type, limit = 50 } = args;

    let deliverables;

    // Build query based on filters
    if (squad && status) {
      deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_squad_status", (q) => q.eq("squad", squad).eq("status", status))
        .order("desc")
        .take(limit);
    } else if (squad) {
      deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_squad", (q) => q.eq("squad", squad))
        .order("desc")
        .take(limit);
    } else if (status) {
      deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(limit);
    } else if (type) {
      deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_type", (q) => q.eq("type", type))
        .order("desc")
        .take(limit);
    } else {
      deliverables = await ctx.db
        .query("deliverables")
        .order("desc")
        .take(limit);
    }

    // Type filter needs to be applied post-query if combined with other filters
    if (type && (squad || status)) {
      deliverables = deliverables.filter(d => d.type === type);
    }

    // Join with agent names
    const deliverablesWithAgents = await Promise.all(
      deliverables.map(async (d) => {
        try {
          const agent = d.createdByAgentId 
            ? await ctx.db.get(d.createdByAgentId) 
            : null;
          return {
            ...d,
            createdByName: agent?.name ?? "Unknown Agent",
            createdByRole: agent?.role ?? "Unknown",
          };
        } catch (err) {
          console.error(`Error fetching agent for deliverable ${d._id}:`, err);
          return {
            ...d,
            createdByName: "Unknown Agent",
            createdByRole: "Unknown",
          };
        }
      })
    );

    return {
      items: deliverablesWithAgents,
      cursor: deliverables.length === limit 
        ? deliverables[deliverables.length - 1]._id 
        : undefined,
    };
  },
});

/**
 * Get a single deliverable by ID with agent name and version history
 */
export const get = query({
  args: { id: v.id("deliverables") },
  handler: async (ctx, args) => {
    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) return null;

    const agent = await ctx.db.get(deliverable.createdByAgentId);
    
    // Get version history
    const versions = await ctx.db
      .query("deliverableVersions")
      .withIndex("by_deliverable", (q) => q.eq("deliverableId", args.id))
      .order("desc")
      .take(10);

    return {
      ...deliverable,
      createdByName: agent?.name ?? "Unknown Agent",
      createdByRole: agent?.role ?? "Unknown",
      versions,
    };
  },
});

/**
 * Search deliverables by title or content
 */
export const search = query({
  args: {
    query: v.string(),
    squad: v.optional(v.union(v.literal('oceans-11'), v.literal('dune'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query: searchQuery, squad, limit = 20 } = args;
    const lowerQuery = searchQuery.toLowerCase();

    // Get all deliverables (in production, this would use full-text search)
    let deliverables;
    if (squad) {
      deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_squad", (q) => q.eq("squad", squad))
        .take(100);
    } else {
      deliverables = await ctx.db
        .query("deliverables")
        .take(100);
    }

    // Filter by search query
    const filtered = deliverables.filter(d => 
      d.title.toLowerCase().includes(lowerQuery) ||
      (d.content?.toLowerCase().includes(lowerQuery) ?? false)
    );

    // Join with agent names
    const deliverablesWithAgents = await Promise.all(
      filtered.slice(0, limit).map(async (d) => {
        const agent = await ctx.db.get(d.createdByAgentId);
        return {
          ...d,
          createdByName: agent?.name ?? "Unknown Agent",
        };
      })
    );

    return deliverablesWithAgents;
  },
});

/**
 * Get deliverables by task ID
 */
export const byTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(50);

    const deliverablesWithAgents = await Promise.all(
      deliverables.map(async (d) => {
        const agent = await ctx.db.get(d.createdByAgentId);
        return {
          ...d,
          createdByName: agent?.name ?? "Unknown Agent",
        };
      })
    );

    return deliverablesWithAgents;
  },
});

/**
 * Get deliverables by agent ID
 */
export const byAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_agent", (q) => q.eq("createdByAgentId", args.agentId))
      .order("desc")
      .take(50);

    return deliverables;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new deliverable
 */
export const create = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal('research'),
      v.literal('blog_draft'),
      v.literal('email_copy'),
      v.literal('white_paper'),
      v.literal('presentation'),
      v.literal('image'),
      v.literal('spreadsheet'),
      v.literal('brief'),
      v.literal('other')
    ),
    squad: v.union(v.literal('oceans-11'), v.literal('dune')),
    content: v.optional(v.string()),
    contentFormat: v.optional(v.union(v.literal('markdown'), v.literal('plain'), v.literal('html'))),
    structuredData: v.optional(v.any()),
    fileUrl: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const agent = await getAuthUser(ctx);
    if (!agent) {
      throw new Error("Unauthorized: Must be authenticated to create deliverables");
    }

    const now = Date.now();

    const deliverableId = await ctx.db.insert("deliverables", {
      title: args.title,
      type: args.type,
      createdByAgentId: agent._id,
      taskId: args.taskId,
      squad: args.squad,
      content: args.content,
      contentFormat: args.contentFormat ?? 'markdown',
      structuredData: args.structuredData,
      fileUrl: args.fileUrl,
      fileType: args.fileType,
      fileSize: args.fileSize,
      status: 'draft',
      version: 1,
      parentVersionId: undefined,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial version record
    await ctx.db.insert("deliverableVersions", {
      deliverableId,
      version: 1,
      content: args.content,
      structuredData: args.structuredData,
      editedBy: agent.name,
      changeSummary: "Initial creation",
      createdAt: now,
    });

    // Log activity
    await ctx.db.insert("activities", {
      agentId: agent._id,
      taskId: args.taskId,
      action: "created_deliverable",
      details: { deliverableId, title: args.title, type: args.type },
    });

    return deliverableId;
  },
});

/**
 * Update a deliverable (creates version history automatically)
 */
export const update = mutation({
  args: {
    id: v.id("deliverables"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    contentFormat: v.optional(v.union(v.literal('markdown'), v.literal('plain'), v.literal('html'))),
    structuredData: v.optional(v.any()),
    fileUrl: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    status: v.optional(v.union(v.literal('draft'), v.literal('review'), v.literal('approved'), v.literal('published'), v.literal('archived'))),
    changeSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await getAuthUser(ctx);
    if (!agent) {
      throw new Error("Unauthorized: Must be authenticated to update deliverables");
    }

    const { id, changeSummary, ...updates } = args;
    const deliverable = await ctx.db.get(id);
    
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const now = Date.now();
    const newVersion = deliverable.version + 1;

    // Create version history record before updating
    await ctx.db.insert("deliverableVersions", {
      deliverableId: id,
      version: newVersion,
      content: updates.content ?? deliverable.content,
      structuredData: updates.structuredData ?? deliverable.structuredData,
      editedBy: agent.name,
      changeSummary: changeSummary ?? "Content updated",
      createdAt: now,
    });

    // Update the deliverable
    await ctx.db.patch(id, {
      ...updates,
      version: newVersion,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activities", {
      agentId: agent._id,
      taskId: deliverable.taskId,
      action: "updated_deliverable",
      details: { 
        deliverableId: id, 
        title: updates.title ?? deliverable.title,
        version: newVersion,
        statusChange: updates.status && updates.status !== deliverable.status 
          ? { from: deliverable.status, to: updates.status }
          : undefined,
      },
    });

    return { success: true, version: newVersion };
  },
});

/**
 * Update deliverable status only (workflow transitions)
 */
export const updateStatus = mutation({
  args: {
    id: v.id("deliverables"),
    status: v.union(v.literal('draft'), v.literal('review'), v.literal('approved'), v.literal('published'), v.literal('archived')),
    changeSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await getAuthUser(ctx);
    if (!agent) {
      throw new Error("Unauthorized");
    }

    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const now = Date.now();
    const newVersion = deliverable.version + 1;

    // Create version history for status change
    await ctx.db.insert("deliverableVersions", {
      deliverableId: args.id,
      version: newVersion,
      content: deliverable.content,
      structuredData: deliverable.structuredData,
      editedBy: agent.name,
      changeSummary: args.changeSummary ?? `Status changed from ${deliverable.status} to ${args.status}`,
      createdAt: now,
    });

    await ctx.db.patch(args.id, {
      status: args.status,
      version: newVersion,
      updatedAt: now,
    });

    return { success: true, version: newVersion };
  },
});

/**
 * Delete a deliverable (soft delete via archiving)
 */
export const archive = mutation({
  args: { id: v.id("deliverables") },
  handler: async (ctx, args) => {
    const agent = await getAuthUser(ctx);
    if (!agent) {
      throw new Error("Unauthorized");
    }

    const deliverable = await ctx.db.get(args.id);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const now = Date.now();
    const newVersion = deliverable.version + 1;

    await ctx.db.insert("deliverableVersions", {
      deliverableId: args.id,
      version: newVersion,
      content: deliverable.content,
      structuredData: deliverable.structuredData,
      editedBy: agent.name,
      changeSummary: `Archived from status: ${deliverable.status}`,
      createdAt: now,
    });

    await ctx.db.patch(args.id, {
      status: 'archived',
      version: newVersion,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Hard delete a deliverable (admin only)
 */
export const remove = mutation({
  args: { id: v.id("deliverables") },
  handler: async (ctx, args) => {
    const agent = await getAuthUser(ctx);
    if (!agent) {
      throw new Error("Unauthorized");
    }

    // Only leads can hard delete
    if (agent.level !== 'lead') {
      throw new Error("Only lead agents can permanently delete deliverables");
    }

    // Delete all versions first
    const versions = await ctx.db
      .query("deliverableVersions")
      .withIndex("by_deliverable", (q) => q.eq("deliverableId", args.id))
      .collect();

    for (const version of versions) {
      await ctx.db.delete(version._id);
    }

    // Delete the deliverable
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// ============================================================================
// STATS & METRICS
// ============================================================================

/**
 * Get deliverable statistics by squad
 */
export const stats = query({
  args: {
    squad: v.optional(v.union(v.literal('oceans-11'), v.literal('dune'))),
  },
  handler: async (ctx, args) => {
    let deliverables;
    
    if (args.squad) {
      const squadFilter = args.squad; // Narrow the type
      deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_squad", (q) => q.eq("squad", squadFilter))
        .collect();
    } else {
      deliverables = await ctx.db
        .query("deliverables")
        .collect();
    }

    const stats = {
      total: deliverables.length,
      byStatus: {
        draft: deliverables.filter(d => d.status === 'draft').length,
        review: deliverables.filter(d => d.status === 'review').length,
        approved: deliverables.filter(d => d.status === 'approved').length,
        published: deliverables.filter(d => d.status === 'published').length,
        archived: deliverables.filter(d => d.status === 'archived').length,
      },
      byType: {
        research: deliverables.filter(d => d.type === 'research').length,
        blog_draft: deliverables.filter(d => d.type === 'blog_draft').length,
        email_copy: deliverables.filter(d => d.type === 'email_copy').length,
        white_paper: deliverables.filter(d => d.type === 'white_paper').length,
        presentation: deliverables.filter(d => d.type === 'presentation').length,
        image: deliverables.filter(d => d.type === 'image').length,
        spreadsheet: deliverables.filter(d => d.type === 'spreadsheet').length,
        brief: deliverables.filter(d => d.type === 'brief').length,
        other: deliverables.filter(d => d.type === 'other').length,
      },
    };

    return stats;
  },
});