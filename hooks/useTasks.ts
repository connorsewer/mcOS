'use client'

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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
  return useQuery(api.tasks.list, args);
}

/**
 * Get a single task by ID.
 */
export function useTask(id: Id<"tasks">) {
  return useQuery(api.tasks.get, { id });
}

/**
 * Get tasks requiring attention (review + blocked).
 */
export function useAttentionTasks() {
  return useQuery(api.tasks.attention);
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
