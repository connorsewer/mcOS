'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConvexReady } from "@/components/convex-provider";

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'executed';

export interface Approval {
  _id: Id<"approvals">;
  _creationTime: number;
  actionType: string;
  payload: any;
  status: ApprovalStatus;
  createdAt: number;
  updatedAt: number;
  requestedByAgentId?: Id<"agents">;
  requestedByName?: string;
  decidedBy?: string;
  decisionNote?: string;
  relatedTaskId?: Id<"tasks">;
  taskTitle?: string | null;
  correlationId?: string;
  executedAt?: number;
  executionResult?: any;
}

/**
 * List approvals with optional status filter
 */
export function useApprovals(args?: {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
}) {
  const isReady = useConvexReady();
  const result = useQuery(
    api.approvals.list,
    isReady ? args ?? {} : "skip"
  );
  return isReady ? result : undefined;
}

/**
 * Get approval stats
 */
export function useApprovalStats() {
  const isReady = useConvexReady();
  const result = useQuery(
    api.approvals.stats,
    isReady ? {} : "skip"
  );
  return isReady ? result : undefined;
}

/**
 * Get a single approval by ID
 */
export function useApproval(id?: string) {
  const isReady = useConvexReady();
  const result = useQuery(
    api.approvals.get,
    isReady && id ? { id: id as Id<"approvals"> } : "skip"
  );
  return isReady ? result : undefined;
}

/**
 * Decide on an approval (approve/reject)
 */
export function useDecideApproval() {
  const mutate = useMutation(api.approvals.decide);
  return (args: {
    id: string;
    decision: 'approved' | 'rejected';
    decidedBy: string;
    decisionNote?: string;
  }) => mutate({ 
    ...args, 
    id: args.id as Id<"approvals">,
  });
}

/**
 * Create a new approval request
 */
export function useCreateApproval() {
  return useMutation(api.approvals.create);
}
