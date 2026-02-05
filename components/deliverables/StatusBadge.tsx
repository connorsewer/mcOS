'use client';

import { cn } from '@/lib/utils';

type DeliverableStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

interface StatusBadgeProps {
  status: DeliverableStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<DeliverableStatus, { 
  label: string; 
  bgColor: string; 
  textColor: string;
  dotColor: string;
}> = {
  draft: {
    label: 'Draft',
    bgColor: 'bg-zinc-800',
    textColor: 'text-zinc-400',
    dotColor: 'bg-zinc-500',
  },
  review: {
    label: 'In Review',
    bgColor: 'bg-amber-950/50',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-emerald-950/50',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  published: {
    label: 'Published',
    bgColor: 'bg-blue-950/50',
    textColor: 'text-blue-400',
    dotColor: 'bg-blue-500',
  },
  archived: {
    label: 'Archived',
    bgColor: 'bg-zinc-900',
    textColor: 'text-zinc-500',
    dotColor: 'bg-zinc-600',
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    dot: 'w-2 h-2',
  },
  lg: {
    container: 'px-3 py-1.5 text-sm',
    dot: 'w-2.5 h-2.5',
  },
};

export function StatusBadge({ status, size = 'md', showDot = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeStyle.container,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full',
            config.dotColor,
            sizeStyle.dot,
            status === 'review' && 'animate-pulse'
          )}
        />
      )}
      {config.label}
    </span>
  );
}
