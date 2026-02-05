'use client'

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type Squad = "oceans-11" | "dune";

export type AgentLevel = "intern" | "specialist" | "lead";

export type AgentStatus = "idle" | "active" | "blocked" | "archived";

export type Agent = {
  _id: Id<"agents">;
  _creationTime: number;
  name: string;
  role: string;
  squad: Squad;
  sessionKey: string;
  level: AgentLevel;
  status: AgentStatus;
  currentTaskId?: Id<"tasks">;
  lastHeartbeat?: number;
  lastMutationAt?: number;
  hourlyMutationCount?: number;
};

/**
 * Get all agents with optional squad filtering.
 */
export function useAgents(args: { squad?: Squad } = {}) {
  return useQuery(api.agents.list, args);
}

/**
 * Get a single agent by ID.
 */
export function useAgent(id: Id<"agents">) {
  return useQuery(api.agents.get, { id });
}

/**
 * Get agent by session key.
 */
export function useAgentBySessionKey(sessionKey: string) {
  return useQuery(api.agents.bySessionKey, { sessionKey });
}
