'use client';

import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Squad = 'oceans-11' | 'dune';
type Status = 'draft' | 'review' | 'approved' | 'published' | 'archived';
type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';

interface FilterState {
  squad: Squad | 'all';
  status: Status | 'all';
  type: DeliverableType | 'all';
  search: string;
}

interface DeliverableFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  userSquad: Squad;
  showSquadFilter?: boolean;
}

const squadOptions: { value: Squad | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Squads', color: 'text-zinc-400' },
  { value: 'oceans-11', label: "Ocean's 11", color: 'text-blue-400' },
  { value: 'dune', label: 'Dune', color: 'text-purple-400' },
];

const statusOptions: { value: Status | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Status', color: 'text-zinc-400' },
  { value: 'draft', label: 'Draft', color: 'text-zinc-500' },
  { value: 'review', label: 'In Review', color: 'text-amber-400' },
  { value: 'approved', label: 'Approved', color: 'text-emerald-400' },
  { value: 'published', label: 'Published', color: 'text-blue-400' },
  { value: 'archived', label: 'Archived', color: 'text-zinc-600' },
];

const typeOptions: { value: DeliverableType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'research', label: 'Research' },
  { value: 'blog_draft', label: 'Blog Draft' },
  { value: 'email_copy', label: 'Email Copy' },
  { value: 'white_paper', label: 'White Paper' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'image', label: 'Image' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'brief', label: 'Brief' },
  { value: 'other', label: 'Other' },
];

export function DeliverableFilters({ filters, onChange, userSquad, showSquadFilter = true }: DeliverableFiltersProps) {
  const hasActiveFilters = filters.status !== 'all' || filters.type !== 'all' || filters.search;

  const clearFilters = () => {
    onChange({
      squad: userSquad,
      status: 'all',
      type: 'all',
      search: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Main Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search deliverables..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg',
              'bg-zinc-900 border border-zinc-800',
              'text-zinc-100 placeholder:text-zinc-500',
              'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50',
              'transition-colors'
            )}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as Status | 'all' })}
            className={cn(
              'px-3 py-2 rounded-lg',
              'bg-zinc-900 border border-zinc-800',
              'text-zinc-100',
              'focus:outline-none focus:border-amber-500/50',
              'cursor-pointer'
            )}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value as DeliverableType | 'all' })}
          className={cn(
            'px-3 py-2 rounded-lg',
            'bg-zinc-900 border border-zinc-800',
            'text-zinc-100',
            'focus:outline-none focus:border-amber-500/50',
            'cursor-pointer'
          )}
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Squad Filter (optional) */}
        {showSquadFilter && (
          <select
            value={filters.squad}
            onChange={(e) => onChange({ ...filters, squad: e.target.value as Squad | 'all' })}
            className={cn(
              'px-3 py-2 rounded-lg',
              'bg-zinc-900 border border-zinc-800',
              'text-zinc-100',
              'focus:outline-none focus:border-amber-500/50',
              'cursor-pointer'
            )}
          >
            {squadOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={cn(
              'px-3 py-2 rounded-lg',
              'text-zinc-500 hover:text-zinc-300',
              'hover:bg-zinc-800',
              'transition-colors',
              'flex items-center gap-1'
            )}
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wide">Active:</span>
          
          {filters.status !== 'all' && (
            <button
              onClick={() => onChange({ ...filters, status: 'all' })}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                'bg-zinc-800 text-zinc-300',
                'hover:bg-zinc-700 transition-colors'
              )}
            >
              Status: {statusOptions.find(o => o.value === filters.status)?.label}
              <X className="w-3 h-3" />
            </button>
          )}
          
          {filters.type !== 'all' && (
            <button
              onClick={() => onChange({ ...filters, type: 'all' })}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                'bg-zinc-800 text-zinc-300',
                'hover:bg-zinc-700 transition-colors'
              )}
            >
              Type: {typeOptions.find(o => o.value === filters.type)?.label}
              <X className="w-3 h-3" />
            </button>
          )}
          
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                'bg-zinc-800 text-zinc-300',
                'hover:bg-zinc-700 transition-colors'
              )}
            >
              Search: &quot;{filters.search}&quot;
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
