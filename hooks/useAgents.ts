'use client'

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConvexReady } from "@/components/convex-provider";

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
  const isReady = useConvexReady();
  const result = useQuery(api.agents.list, isReady ? args : "skip");
  return isReady ? result : undefined;
}

/**
 * Get a single agent by ID.
 */
export function useAgent(id: Id<"agents">) {
  const isReady = useConvexReady();
  const result = useQuery(api.agents.get, isReady ? { id } : "skip");
  return isReady ? result : undefined;
}

/**
 * Get agent by session key.
 */
export function useAgentBySessionKey(sessionKey: string) {
  const isReady = useConvexReady();
  const result = useQuery(api.agents.bySessionKey, isReady ? { sessionKey } : "skip");
  return isReady ? result : undefined;
}
