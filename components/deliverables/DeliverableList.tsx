'use client';

import { useState } from 'react';
import { LayoutGrid, List, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeliverableCard } from './DeliverableCard';
import type { Deliverable } from '@/hooks/useDeliverables';

interface DeliverableListProps {
  deliverables: Deliverable[];
  isLoading?: boolean;
  onSelect: (deliverable: Deliverable | null) => void;
  emptyMessage?: string;
}

export function DeliverableList({ 
  deliverables, 
  isLoading = false, 
  onSelect,
  emptyMessage = 'No deliverables found'
}: DeliverableListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (deliverables.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
          <LayoutGrid className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300 mb-2">{emptyMessage}</h3>
        <p className="text-sm text-zinc-500">Create a new deliverable to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing <span className="text-zinc-300 font-medium">{deliverables.length}</span> deliverables
        </p>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid' 
                ? 'bg-zinc-800 text-amber-400' 
                : 'text-zinc-500 hover:text-zinc-300'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'list' 
                ? 'bg-zinc-800 text-amber-400' 
                : 'text-zinc-500 hover:text-zinc-300'
            )}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deliverables Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {deliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable._id}
              {...deliverable}
              onClick={() => onSelect(deliverable)}
              view="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {deliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable._id}
              {...deliverable}
              onClick={() => onSelect(deliverable)}
              view="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}
