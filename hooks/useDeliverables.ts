'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConvexReady } from "@/components/convex-provider";

export type Squad = 'oceans-11' | 'dune';
export type Status = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';

export interface Deliverable {
  _id: string;
  _creationTime: number;
  title: string;
  type: DeliverableType;
  status: Status;
  squad: Squad;
  createdByName: string;
  createdByAgentId?: string;
  version: number;
  updatedAt: number;
  createdAt: number;
  content?: string;
  contentFormat?: 'markdown' | 'plain' | 'html';
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  tags?: string[];
}

interface ListResult {
  items: Deliverable[];
  cursor?: string;
}

/**
 * List deliverables with optional filtering
 */
export function useDeliverables(args?: {
  squad?: Squad;
  status?: Status;
  type?: DeliverableType;
  limit?: number;
}) {
  const isReady = useConvexReady();
  const result = useQuery(
    api.deliverables.list,
    isReady ? args ?? {} : "skip"
  );
  return isReady ? result : undefined;
}

/**
 * Search deliverables
 */
export function useDeliverablesSearch(args?: {
  query?: string;
  squad?: Squad;
  limit?: number;
}) {
  const isReady = useConvexReady();
  const result = useQuery(
    api.deliverables.search,
    isReady && args?.query ? { query: args.query, squad: args.squad, limit: args.limit } : "skip"
  );
  return isReady ? result : undefined;
}

/**
 * Get a single deliverable by ID
 */
export function useDeliverable(id?: string) {
  const isReady = useConvexReady();
  const result = useQuery(
    api.deliverables.get,
    isReady && id ? { id: id as Id<"deliverables"> } : "skip"
  );
  return isReady ? result : undefined;
}

/**
 * Create a new deliverable
 */
export function useCreateDeliverable() {
  return useMutation(api.deliverables.create);
}

/**
 * Update a deliverable
 */
export function useUpdateDeliverable() {
  const mutate = useMutation(api.deliverables.update);
  return (args: {
    id: string;
    title: string;
    content?: string;
    contentFormat?: 'markdown' | 'plain' | 'html';
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    changeSummary: string;
  }) => mutate({ ...args, id: args.id as Id<"deliverables"> });
}

/**
 * Update deliverable status
 */
export function useUpdateDeliverableStatus() {
  const mutate = useMutation(api.deliverables.updateStatus);
  return (args: {
    id: string;
    status: Status;
    changeSummary?: string;
  }) => mutate({ ...args, id: args.id as Id<"deliverables"> });
}

/**
 * Archive a deliverable
 */
export function useArchiveDeliverable() {
  const mutate = useMutation(api.deliverables.archive);
  return (args: { id: string }) => mutate({ id: args.id as Id<"deliverables"> });
}
