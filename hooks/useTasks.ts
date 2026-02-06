'use client'

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";

export type Squad = "oceans-11" | "dune";

export type TaskStatus = 
  | "inbox" 
  | "assigned" 
  | "in_progress" 
  | "review" 
  | "done" 
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  squad: Squad;
  assigneeIds: Id<"agents">[];
  createdBy: string;
  createdByAgentId?: Id<"agents">;
  dueDate?: number;
  archivedAt?: number;
  archivedBy?: Id<"agents">;
};

export type CreateTaskArgs = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  squad: Squad;
  assigneeIds?: Id<"agents">[];
  dueDate?: number;
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
 * Get all tasks with optional filtering.
 */
export function useTasks(args: { 
  status?: TaskStatus; 
  squad?: Squad 
} = {}) {
  const isClient = useIsClient();
  const result = useQuery(api.tasks.list, isClient ? args : "skip");
  return isClient ? result : undefined;
}

/**
 * Get a single task by ID.
 */
export function useTask(id: Id<"tasks">) {
  const isClient = useIsClient();
  const result = useQuery(api.tasks.get, isClient ? { id } : "skip");
  return isClient ? result : undefined;
}

/**
 * Get tasks requiring attention (review + blocked).
 */
export function useAttentionTasks() {
  const isClient = useIsClient();
  const result = useQuery(api.tasks.attention, isClient ? {} : "skip");
  return isClient ? result : undefined;
}

/**
 * Create a new task.
 */
export function useCreateTask() {
  return useMutation(api.tasks.create);
}

/**
 * Update task status.
 */
export function useUpdateTaskStatus() {
  return useMutation(api.tasks.updateStatus);
}

/**
 * Archive a task.
 */
export function useArchiveTask() {
  return useMutation(api.tasks.archive);
}
