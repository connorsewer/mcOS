'use client'

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";

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

// Hook to detect if we're on the client
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}

/**
 * Get all agents with optional squad filtering.
 */
export function useAgents(args: { squad?: Squad } = {}) {
  const isClient = useIsClient();
  const result = useQuery(api.agents.list, isClient ? args : "skip");
  return isClient ? result : undefined;
}

/**
 * Get a single agent by ID.
 */
export function useAgent(id: Id<"agents">) {
  const isClient = useIsClient();
  const result = useQuery(api.agents.get, isClient ? { id } : "skip");
  return isClient ? result : undefined;
}

/**
 * Get agent by session key.
 */
export function useAgentBySessionKey(sessionKey: string) {
  const isClient = useIsClient();
  const result = useQuery(api.agents.bySessionKey, isClient ? { sessionKey } : "skip");
  return isClient ? result : undefined;
}
