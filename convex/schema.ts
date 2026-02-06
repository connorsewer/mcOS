import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Agents table
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    squad: v.union(v.literal("oceans-11"), v.literal("dune")),
    sessionKey: v.string(),
    level: v.union(v.literal("intern"), v.literal("specialist"), v.literal("lead")),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
    lastHeartbeat: v.optional(v.number()),
  })
    .index("by_sessionKey", ["sessionKey"])
    .index("by_squad", ["squad"]),

  // Tasks table
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    squad: v.union(v.literal("oceans-11"), v.literal("dune")),
    assigneeIds: v.array(v.id("agents")),
    createdBy: v.string(),
    dueDate: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.id("agents")),
  })
    .index("by_status", ["status"])
    .index("by_squad", ["squad"])
    .index("by_squad_status", ["squad", "status"]),

  // Messages/Comments
  messages: defineTable({
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    content: v.string(),
    mentions: v.array(v.id("agents")),
  })
    .index("by_task", ["taskId"]),

  // Activity feed
  activities: defineTable({
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    squad: v.optional(v.union(v.literal("oceans-11"), v.literal("dune"))),
    action: v.string(),
    details: v.optional(v.any()),
    createdAt: v.optional(v.number()),
    agentName: v.optional(v.string()),
    agentRole: v.optional(v.string()),
  })
    .index("by_agent", ["agentId"])
    .index("by_task", ["taskId"])
    .index("by_squad", ["squad"]),

  // Documents (deliverables) - Legacy table, keeping for compatibility
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("deliverable"), v.literal("research"), v.literal("strategy")),
    taskId: v.optional(v.id("tasks")),
    createdBy: v.id("agents"),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_task", ["taskId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["type", "taskId"],
    }),

  // Deliverables table - New comprehensive deliverables system
  deliverables: defineTable({
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
    createdByAgentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    squad: v.union(v.literal('oceans-11'), v.literal('dune')),
    content: v.optional(v.string()), // Markdown
    contentFormat: v.optional(v.union(v.literal('markdown'), v.literal('plain'), v.literal('html'))),
    structuredData: v.optional(v.any()), // JSON
    fileUrl: v.optional(v.string()), // R2 URL for binaries
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    status: v.union(v.literal('draft'), v.literal('review'), v.literal('approved'), v.literal('published'), v.literal('archived')),
    version: v.number(),
    parentVersionId: v.optional(v.id("deliverables")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_agent", ["createdByAgentId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_squad", ["squad"])
    .index("by_squad_status", ["squad", "status"]),

  // Deliverable versions history
  deliverableVersions: defineTable({
    deliverableId: v.id("deliverables"),
    version: v.number(),
    content: v.optional(v.string()),
    structuredData: v.optional(v.any()),
    editedBy: v.string(),
    changeSummary: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_deliverable", ["deliverableId"])
    .index("by_deliverable_version", ["deliverableId", "version"]),

  // Approvals table (human-in-the-loop gates)
  approvals: defineTable({
    actionType: v.string(),
    payload: v.any(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("executed")),
    createdAt: v.number(),
    updatedAt: v.number(),
    requestedByAgentId: v.optional(v.id("agents")),
    decidedBy: v.optional(v.string()),
    decisionNote: v.optional(v.string()),
    relatedTaskId: v.optional(v.id("tasks")),
    correlationId: v.optional(v.string()),
    executedAt: v.optional(v.number()),
    executionResult: v.optional(v.any()),
  })
    .index("by_status", ["status"])
    .index("by_task", ["relatedTaskId"]),

  // Swarm activity - real-time state for MCOS Live tab
  swarmActivity: defineTable({
    source: v.string(), // 'conductor', 'system', 'cron', etc.
    activityType: v.union(
      v.literal("state_update"),
      v.literal("worker_spawned"),
      v.literal("task_completed"),
      v.literal("approval_requested"),
      v.literal("approval_executed"),
      v.literal("error"),
      v.literal("info")
    ),
    payload: v.any(),
    createdAt: v.number(),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    squad: v.optional(v.union(v.literal("oceans-11"), v.literal("dune"))),
  })
    .index("by_created", ["createdAt"])
    .index("by_type", ["activityType"])
    .index("by_agent", ["agentId"])
    .index("by_task", ["taskId"])
    .index("by_squad", ["squad"]),
});
