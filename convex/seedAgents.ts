import { internalMutation } from "./_generated/server";

export const seedAll = internalMutation({
  handler: async (ctx) => {
    // Ocean's 11 Squad (TSI Marketing)
    await ctx.db.insert("agents", {
      name: "Danny Ocean",
      role: "Squad Lead",
      squad: "oceans-11",
      sessionKey: "agent:tsi:squad-lead",
      level: "lead",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Rusty Ryan",
      role: "Campaign Strategist",
      squad: "oceans-11",
      sessionKey: "agent:tsi:strategy",
      level: "lead",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Livingston Dell",
      role: "Analytics & SEO",
      squad: "oceans-11",
      sessionKey: "agent:tsi:analytics",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Frank Catton",
      role: "Competitive Intel",
      squad: "oceans-11",
      sessionKey: "agent:tsi:competitive-intel",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Linus Caldwell",
      role: "Research",
      squad: "oceans-11",
      sessionKey: "agent:tsi:research",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Basher Tarr",
      role: "Long-Form Content",
      squad: "oceans-11",
      sessionKey: "agent:tsi:content-longform",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Saul Bloom",
      role: "Copywriter",
      squad: "oceans-11",
      sessionKey: "agent:tsi:copywriter",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Virgil Malloy",
      role: "Distribution",
      squad: "oceans-11",
      sessionKey: "agent:tsi:distribution",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Turk Malloy",
      role: "Operations",
      squad: "oceans-11",
      sessionKey: "agent:tsi:operations",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "The Amazing Yen",
      role: "Designer",
      squad: "oceans-11",
      sessionKey: "agent:tsi:design",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Reuben Tishkoff",
      role: "Executive Comms",
      squad: "oceans-11",
      sessionKey: "agent:tsi:executive-comms",
      level: "specialist",
      status: "idle",
    });

    // Dune Squad (Personal & Job Search)
    await ctx.db.insert("agents", {
      name: "Paul Atreides",
      role: "Squad Lead",
      squad: "dune",
      sessionKey: "agent:personal:squad-lead",
      level: "lead",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Duke Leto",
      role: "Career Strategy",
      squad: "dune",
      sessionKey: "agent:personal:career-strategy",
      level: "lead",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Thufir Hawat",
      role: "Mentat/Analytics",
      squad: "dune",
      sessionKey: "agent:personal:mentat",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Liet Kynes",
      role: "Company Research",
      squad: "dune",
      sessionKey: "agent:personal:company-research",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Gurney Halleck",
      role: "Personal Brand",
      squad: "dune",
      sessionKey: "agent:personal:content",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Lady Jessica",
      role: "Interview Coach",
      squad: "dune",
      sessionKey: "agent:personal:interview-coach",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Stilgar",
      role: "Network Navigator",
      squad: "dune",
      sessionKey: "agent:personal:network",
      level: "specialist",
      status: "idle",
    });
    await ctx.db.insert("agents", {
      name: "Duncan Idaho",
      role: "Personal Assistant",
      squad: "dune",
      sessionKey: "agent:personal:assistant",
      level: "specialist",
      status: "idle",
    });

    return { success: true, count: 19 };
  },
});
