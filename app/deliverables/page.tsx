'use client';

import { unstable_noStore } from "next/cache";
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

import { DeliverableList } from '@/components/deliverables/DeliverableList';
import { DeliverableFilters } from '@/components/deliverables/DeliverableFilters';
import { DeliverableEditor } from '@/components/deliverables/DeliverableEditor';
import { DeliverableDetail } from '@/components/deliverables/DeliverableDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Squad = 'oceans-11' | 'dune';
type Status = 'draft' | 'review' | 'approved' | 'published' | 'archived';
type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';

interface FilterState {
  squad: Squad | 'all';
  status: Status | 'all';
  type: DeliverableType | 'all';
  search: string;
}

// Deliverable interface - using string for _id as that's the runtime type
// Convex branded Id types serialize to strings when passed between components
interface Deliverable {
  _id: string;
  title: string;
  type: DeliverableType;
  status: Status;
  squad: Squad;
  createdByName: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  content?: string;
  fileUrl?: string;
  fileType?: string;
}

export default function DeliverablesPage() {
  unstable_noStore();

  // Get current user's squad (in production, this would come from auth context)
  const [userSquad] = useState<Squad>('oceans-11');
  
  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    squad: userSquad,
    status: 'all',
    type: 'all',
    search: '',
  });

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  // Fetch deliverables from Convex
  const deliverablesResult = useQuery(
    api.deliverables.list,
    filters.squad !== 'all' || filters.status !== 'all'
      ? {
          squad: filters.squad !== 'all' ? filters.squad : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          type: filters.type !== 'all' ? filters.type : undefined,
          limit: 50,
        }
      : { limit: 50 }
  );

  // Fetch search results if search is active
  const searchResults = useQuery(
    api.deliverables.search,
    filters.search
      ? {
          query: filters.search,
          squad: filters.squad !== 'all' ? filters.squad : undefined,
          limit: 50,
        }
      : 'skip'
  );

  // Get detailed deliverable when selected
  const detailedDeliverable = useQuery(
    api.deliverables.get,
    selectedDeliverable?._id ? { id: selectedDeliverable._id as Id<'deliverables'> } : 'skip'
  );

  // Mutations
  const createDeliverable = useMutation(api.deliverables.create);
  const updateDeliverable = useMutation(api.deliverables.update);
  const updateStatus = useMutation(api.deliverables.updateStatus);

  // Handle create
  const handleCreate = async (data: {
    title: string;
    content: string;
    contentFormat: 'markdown' | 'plain' | 'html';
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
  }) => {
    try {
      await createDeliverable({
        title: data.title,
        type: 'other', // Default type - can be changed later
        squad: userSquad,
        content: data.content,
        contentFormat: data.contentFormat,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create deliverable:', error);
      alert('Failed to create deliverable. Please try again.');
    }
  };

  // Handle update
  const handleUpdate = async (data: {
    title: string;
    content: string;
    contentFormat: 'markdown' | 'plain' | 'html';
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    changeSummary: string;
  }) => {
    if (!selectedDeliverable) return;
    
    try {
      await updateDeliverable({
        id: selectedDeliverable._id as Id<'deliverables'>,
        title: data.title,
        content: data.content,
        contentFormat: data.contentFormat,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        changeSummary: data.changeSummary,
      });
    } catch (error) {
      console.error('Failed to update deliverable:', error);
      alert('Failed to update deliverable. Please try again.');
    }
  };

  // Handle status change
  const handleStatusChange = async (status: Status, summary?: string) => {
    if (!selectedDeliverable) return;
    
    try {
      await updateStatus({
        id: selectedDeliverable._id as Id<'deliverables'>,
        status,
        changeSummary: summary,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Determine which data to display
  const displayDeliverables = filters.search
    ? searchResults || []
    : deliverablesResult?.items || [];

  const isLoading = 
    deliverablesResult === undefined || 
    (filters.search !== '' && searchResults === undefined);

  // If a deliverable is selected, show detail view
  if (selectedDeliverable && detailedDeliverable) {
    return (
      <div className="max-w-6xl mx-auto">
        <DeliverableDetail
          deliverable={detailedDeliverable}
          onBack={() => setSelectedDeliverable(null)}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdate}
          isUpdating={false}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Deliverables</h1>
          <p className="text-zinc-500 mt-1">
            Manage research, drafts, and published content
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-amber-500 text-zinc-950 font-medium',
            'hover:bg-amber-400',
            'transition-colors'
          )}
        >
          <Plus className="w-5 h-5" />
          New Deliverable
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Drafts"
          value={displayDeliverables.filter(d => d.status === 'draft').length}
          color="text-zinc-400"
        />
        <StatCard
          label="In Review"
          value={displayDeliverables.filter(d => d.status === 'review').length}
          color="text-amber-400"
        />
        <StatCard
          label="Approved"
          value={displayDeliverables.filter(d => d.status === 'approved').length}
          color="text-emerald-400"
        />
        <StatCard
          label="Published"
          value={displayDeliverables.filter(d => d.status === 'published').length}
          color="text-blue-400"
        />
      </div>

      {/* Filters */}
      <DeliverableFilters
        filters={filters}
        onChange={setFilters}
        userSquad={userSquad}
        showSquadFilter={true}
      />

      {/* Deliverables List */}
      <DeliverableList
        deliverables={displayDeliverables}
        isLoading={isLoading}
        onSelect={setSelectedDeliverable}
        emptyMessage={
          filters.search
            ? 'No deliverables match your search'
            : filters.status !== 'all' || filters.type !== 'all'
            ? 'No deliverables match your filters'
            : 'No deliverables yet'
        }
      />

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-100">
              Create New Deliverable
            </DialogTitle>
          </DialogHeader>
          <DeliverableEditor
            onSave={handleCreate}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
    </div>
  );
}
