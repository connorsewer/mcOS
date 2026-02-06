'use client'

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConvexReady } from "@/components/convex-provider";

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

/**
 * Get all tasks with optional filtering.
 */
export function useTasks(args: { 
  status?: TaskStatus; 
  squad?: Squad 
} = {}) {
  const isReady = useConvexReady();
  const result = useQuery(api.tasks.list, isReady ? args : "skip");
  return isReady ? result : undefined;
}

/**
 * Get a single task by ID.
 */
export function useTask(id: Id<"tasks">) {
  const isReady = useConvexReady();
  const result = useQuery(api.tasks.get, isReady ? { id } : "skip");
  return isReady ? result : undefined;
}

/**
 * Get tasks requiring attention (review + blocked).
 */
export function useAttentionTasks() {
  const isReady = useConvexReady();
  const result = useQuery(api.tasks.attention, isReady ? {} : "skip");
  return isReady ? result : undefined;
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
