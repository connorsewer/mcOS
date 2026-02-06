'use client'

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConvexReady } from "@/components/convex-provider";

export type Squad = "oceans-11" | "dune";

export type UseActivitiesFeedArgs = {
  squad?: Squad;
  initialNumItems?: number;
};

/**
 * Simple limit-based activity list (backward compatible).
 * Returns an array for easy use in existing components.
 */
export function useActivities(args: { limit?: number; squad?: Squad } = {}) {
  const isReady = useConvexReady();
  const result = useQuery(api.activities.list, isReady ? {
    limit: args.limit ?? 50,
    squad: args.squad,
  } : "skip");
  return isReady ? result : undefined;
}

/**
 * Infinite-scroll / paginated activity feed.
 * Uses Convex's real-time subscriptions for live updates.
 */
export function useActivitiesFeed(args: UseActivitiesFeedArgs = {}) {
  const isReady = useConvexReady();
  return usePaginatedQuery(
    api.activities.paginated,
    isReady ? { squad: args.squad } : "skip",
    {
      initialNumItems: args.initialNumItems ?? 50,
    }
  );
}

/**
 * Get activities for a specific agent.
 */
export function useActivitiesByAgent(
  agentId: Id<"agents">,
  opts?: { initialNumItems?: number }
) {
  const isReady = useConvexReady();
  return usePaginatedQuery(
    api.activities.byAgent,
    isReady ? { agentId } : "skip",
    { initialNumItems: opts?.initialNumItems ?? 20 }
  );
}

/**
 * Get activities for a specific task.
 */
export function useActivitiesByTask(
  taskId: Id<"tasks">,
  opts?: { initialNumItems?: number }
) {
  const isReady = useConvexReady();
  return usePaginatedQuery(
    api.activities.byTask,
    isReady ? { taskId } : "skip",
    { initialNumItems: opts?.initialNumItems ?? 20 }
  );
}

/**
 * Helper type for activity items.
 */
export type Activity = {
  _id: Id<"activities">;
  _creationTime: number;
  agentId: Id<"agents">;
  agentName?: string;
  agentRole?: string;
  taskId?: Id<"tasks">;
  squad?: Squad;
  action: string;
  details?: any;
  createdAt?: number;
};
