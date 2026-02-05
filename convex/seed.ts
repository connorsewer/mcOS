import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Agent definitions
const AGENTS: Array<{
  name: string;
  role: string;
  squad: "oceans-11" | "dune";
  level: "intern" | "specialist" | "lead";
  sessionKey: string;
}> = [
  // Ocean's 11
  { name: "Danny Ocean", role: "Squad Lead", squad: "oceans-11", level: "lead", sessionKey: "agent:tsi:danny" },
  { name: "Rusty Ryan", role: "Campaign Strategist", squad: "oceans-11", level: "lead", sessionKey: "agent:tsi:campaigns" },
  { name: "Livingston Dell", role: "SEO & Analytics", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:seo-analytics" },
  { name: "Frank Catton", role: "Competitive Intel", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:competitive" },
  { name: "Linus Caldwell", role: "Research", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:research" },
  { name: "Basher Tarr", role: "Long-Form Content", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:content-long" },
  { name: "Saul Bloom", role: "Copywriter", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:copywriter" },
  { name: "Virgil Malloy", role: "Distribution", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:distribution" },
  { name: "Turk Malloy", role: "Operations", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:operations" },
  { name: "The Amazing Yen", role: "Design", squad: "oceans-11", level: "specialist", sessionKey: "agent:tsi:design" },
  { name: "Reuben Tishkoff", role: "Executive Comms", squad: "oceans-11", level: "lead", sessionKey: "agent:tsi:executive-comms" },
  // Dune
  { name: "Paul Atreides", role: "Squad Lead", squad: "dune", level: "lead", sessionKey: "agent:personal:squad-lead" },
  { name: "Duke Leto", role: "Career Strategy", squad: "dune", level: "lead", sessionKey: "agent:personal:career-strategy" },
  { name: "Thufir Hawat", role: "Mentat/Analytics", squad: "dune", level: "specialist", sessionKey: "agent:personal:mentat" },
  { name: "Liet Kynes", role: "Company Research", squad: "dune", level: "specialist", sessionKey: "agent:personal:company-research" },
  { name: "Gurney Halleck", role: "Personal Brand", squad: "dune", level: "specialist", sessionKey: "agent:personal:content" },
  { name: "Lady Jessica", role: "Interview Coach", squad: "dune", level: "specialist", sessionKey: "agent:personal:interview-coach" },
  { name: "Stilgar", role: "Network Navigator", squad: "dune", level: "specialist", sessionKey: "agent:personal:network" },
  { name: "Duncan Idaho", role: "Personal Assistant", squad: "dune", level: "specialist", sessionKey: "agent:personal:personal-assistant" },
];

// Seed tasks
const SEED_TASKS: Array<{
  title: string;
  description: string;
  status: "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  squad: "oceans-11" | "dune";
}> = [
  { title: "Research xAI GTM Systems role", description: "Deep research on xAI's go-to-market strategy and team structure", status: "in_progress", priority: "urgent", squad: "dune" },
  { title: "Customize resume for fintech", description: "Tailor resume for VP Revenue Ops roles at fintech companies", status: "in_progress", priority: "high", squad: "dune" },
  { title: "Q2 Product Launch White Paper", description: "Create comprehensive white paper for TSI product launch", status: "review", priority: "high", squad: "oceans-11" },
  { title: "Healthcare CFO nurture sequence", description: "Email sequence for healthcare vertical outreach", status: "assigned", priority: "medium", squad: "oceans-11" },
  { title: "Interview prep: Acme Corp", description: "Prepare talking points and likely questions for final round", status: "in_progress", priority: "urgent", squad: "dune" },
  { title: "SEO audit and recommendations", description: "Full SEO audit of current site with actionable recommendations", status: "inbox", priority: "medium", squad: "oceans-11" },
  { title: "Social media content batch", description: "Create 2 weeks of LinkedIn content for Connor", status: "blocked", priority: "medium", squad: "dune" },
  { title: "Brand guidelines document", description: "Document brand voice, colors, and usage guidelines", status: "review", priority: "high", squad: "oceans-11" },
];

export const seed = internalMutation({
  args: {},
  returns: v.object({
    agents: v.number(),
    tasks: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    
    // Clear existing data
    const existingAgents = await ctx.db.query("agents").collect();
    const existingTasks = await ctx.db.query("tasks").collect();
    
    for (const agent of existingAgents) {
      await ctx.db.delete(agent._id);
    }
    for (const task of existingTasks) {
      await ctx.db.delete(task._id);
    }
    
    // Seed agents
    const agentIds: Id<"agents">[] = [];
    for (const agent of AGENTS) {
      const id = await ctx.db.insert("agents", {
        ...agent,
        status: "idle",
        lastHeartbeat: now,
      });
      agentIds.push(id);
    }
    
    // Seed tasks
    let taskCount = 0;
    for (const task of SEED_TASKS) {
      // Pick random assignees from the squad
      const squadAgents = agentIds.filter((_, i) => {
        const agent = AGENTS[i];
        return agent.squad === task.squad;
      });
      
      const assigneeIds = squadAgents.length > 0 
        ? [squadAgents[Math.floor(Math.random() * squadAgents.length)]]
        : [];
      
      await ctx.db.insert("tasks", {
        ...task,
        assigneeIds,
        createdBy: "system",
      });
      taskCount++;
    }
    
    return { agents: agentIds.length, tasks: taskCount };
  }
});
