/**
 * Agent Integration for Deliverables
 * 
 * Helper functions for agents to create and manage deliverables
 * via Convex mutations.
 */

import { ConvexClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';
type Squad = 'oceans-11' | 'dune';
type Status = 'draft' | 'review' | 'approved' | 'published' | 'archived';

interface CreateDeliverableOptions {
  title: string;
  type: DeliverableType;
  squad: Squad;
  content?: string;
  contentFormat?: 'markdown' | 'plain' | 'html';
  structuredData?: Record<string, unknown>;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  taskId?: Id<'tasks'>;
}

interface UpdateDeliverableOptions {
  id: Id<'deliverables'>;
  title?: string;
  content?: string;
  contentFormat?: 'markdown' | 'plain' | 'html';
  structuredData?: Record<string, unknown>;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  status?: Status;
  changeSummary?: string;
}

/**
 * Create a new deliverable
 * 
 * @example
 * ```typescript
 * import { createDeliverable } from '@/lib/deliverables';
 * 
 * const deliverableId = await createDeliverable(convex, {
 *   title: 'Q1 Competitive Analysis',
 *   type: 'research',
 *   squad: 'oceans-11',
 *   content: '# Executive Summary\n\n...',
 *   contentFormat: 'markdown',
 * });
 * ```
 */
export async function createDeliverable(
  client: ConvexClient,
  options: CreateDeliverableOptions
): Promise<Id<'deliverables'>> {
  const { title, type, squad, content, contentFormat, structuredData, fileUrl, fileType, fileSize, taskId } = options;

  return await client.mutation(api.deliverables.create, {
    title,
    type,
    squad,
    content,
    contentFormat: contentFormat ?? 'markdown',
    structuredData,
    fileUrl,
    fileType,
    fileSize,
    taskId,
  });
}

/**
 * Update an existing deliverable
 * 
 * @example
 * ```typescript
 * import { updateDeliverable } from '@/lib/deliverables';
 * 
 * await updateDeliverable(convex, {
 *   id: deliverableId,
 *   content: '# Updated Analysis\n\n...',
 *   changeSummary: 'Added Q2 projections',
 * });
 * ```
 */
export async function updateDeliverable(
  client: ConvexClient,
  options: UpdateDeliverableOptions
): Promise<{ success: boolean; version: number }> {
  const { id, ...updates } = options;

  return await client.mutation(api.deliverables.update, {
    id,
    ...updates,
  });
}

/**
 * Update deliverable status (workflow transition)
 * 
 * @example
 * ```typescript
 * import { transitionStatus } from '@/lib/deliverables';
 * 
 * // Submit for review
 * await transitionStatus(convex, deliverableId, 'review', 'Ready for human review');
 * 
 * // Approve
 * await transitionStatus(convex, deliverableId, 'approved', 'Approved by lead');
 * ```
 */
export async function transitionStatus(
  client: ConvexClient,
  id: Id<'deliverables'>,
  status: Status,
  changeSummary?: string
): Promise<{ success: boolean; version: number }> {
  return await client.mutation(api.deliverables.updateStatus, {
    id,
    status,
    changeSummary,
  });
}

/**
 * Archive a deliverable (soft delete)
 * 
 * @example
 * ```typescript
 * import { archiveDeliverable } from '@/lib/deliverables';
 * 
 * await archiveDeliverable(convex, deliverableId);
 * ```
 */
export async function archiveDeliverable(
  client: ConvexClient,
  id: Id<'deliverables'>
): Promise<{ success: boolean }> {
  return await client.mutation(api.deliverables.archive, { id });
}

/**
 * Get deliverables by task
 * 
 * @example
 * ```typescript
 * import { getDeliverablesByTask } from '@/lib/deliverables';
 * 
 * const deliverables = await getDeliverablesByTask(convex, taskId);
 * ```
 */
export async function getDeliverablesByTask(
  client: ConvexClient,
  taskId: Id<'tasks'>
) {
  return await client.query(api.deliverables.byTask, { taskId });
}

/**
 * Search deliverables
 * 
 * @example
 * ```typescript
 * import { searchDeliverables } from '@/lib/deliverables';
 * 
 * const results = await searchDeliverables(convex, 'competitive analysis', 'oceans-11');
 * ```
 */
export async function searchDeliverables(
  client: ConvexClient,
  query: string,
  squad?: Squad
) {
  return await client.query(api.deliverables.search, { query, squad });
}

/**
 * Type inference helpers for agents
 */
export const DeliverableTypes = {
  RESEARCH: 'research' as const,
  BLOG_DRAFT: 'blog_draft' as const,
  EMAIL_COPY: 'email_copy' as const,
  WHITE_PAPER: 'white_paper' as const,
  PRESENTATION: 'presentation' as const,
  IMAGE: 'image' as const,
  SPREADSHEET: 'spreadsheet' as const,
  BRIEF: 'brief' as const,
  OTHER: 'other' as const,
};

export const Squads = {
  OCEANS_11: 'oceans-11' as const,
  DUNE: 'dune' as const,
};

export const Statuses = {
  DRAFT: 'draft' as const,
  REVIEW: 'review' as const,
  APPROVED: 'approved' as const,
  PUBLISHED: 'published' as const,
  ARCHIVED: 'archived' as const,
};
