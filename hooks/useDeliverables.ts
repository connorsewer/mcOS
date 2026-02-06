'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";

export type Squad = 'oceans-11' | 'dune';
export type Status = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';

export interface Deliverable {
  _id: Id<"deliverables">;
  _creationTime: number;
  title: string;
  type: DeliverableType;
  status: Status;
  squad: Squad;
  createdBy: Id<"agents">;
  createdByName: string;
  version: number;
  updatedAt: number;
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

// Hook to detect if we're on the client
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
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
  const isClient = useIsClient();
  const result = useQuery(
    api.deliverables.list,
    isClient ? args ?? {} : "skip"
  );
  return isClient ? result : undefined;
}

/**
 * Search deliverables
 */
export function useDeliverablesSearch(args?: {
  query?: string;
  squad?: Squad;
  limit?: number;
}) {
  const isClient = useIsClient();
  const result = useQuery(
    api.deliverables.search,
    isClient && args?.query ? args : "skip"
  );
  return isClient ? result : undefined;
}

/**
 * Get a single deliverable by ID
 */
export function useDeliverable(id?: Id<"deliverables">) {
  const isClient = useIsClient();
  const result = useQuery(
    api.deliverables.get,
    isClient && id ? { id } : "skip"
  );
  return isClient ? result : undefined;
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
  return useMutation(api.deliverables.update);
}

/**
 * Update deliverable status
 */
export function useUpdateDeliverableStatus() {
  return useMutation(api.deliverables.updateStatus);
}

/**
 * Archive a deliverable
 */
export function useArchiveDeliverable() {
  return useMutation(api.deliverables.archive);
}
