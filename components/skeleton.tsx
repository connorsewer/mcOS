import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({ 
  className, 
  width = '100%', 
  height = '1rem',
  circle = false 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-skeleton-pulse",
        circle && "rounded-full",
        !circle && "rounded-md",
        className
      )}
      style={{ 
        width, 
        height,
        background: 'linear-gradient(90deg, var(--skeleton-from) 0%, var(--skeleton-to) 50%, var(--skeleton-from) 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

// Pre-built skeleton patterns
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 border rounded-lg bg-card", className)}>
      <Skeleton width="60%" height="1rem" className="mb-3" />
      <Skeleton width="100%" height="0.75rem" className="mb-2" />
      <Skeleton width="80%" height="0.75rem" />
    </div>
  );
}

export function SkeletonAttentionCard() {
  return (
    <div className="p-4 border-l-4 border-l-primary border rounded-lg bg-card">
      <div className="flex items-start justify-between mb-2">
        <Skeleton width="80px" height="1.25rem" />
        <Skeleton width="16px" height="16px" circle />
      </div>
      <Skeleton width="90%" height="0.875rem" className="mb-2" />
      <Skeleton width="60%" height="0.75rem" />
    </div>
  );
}

export function SkeletonActivityRow() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton width="48px" height="0.75rem" />
      <Skeleton width="80px" height="0.875rem" />
      <Skeleton width="60px" height="0.875rem" />
      <Skeleton width="120px" height="0.875rem" />
    </div>
  );
}

export function SkeletonSquadCard() {
  return (
    <div className="p-4 border rounded-lg bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="140px" height="1.25rem" />
        <Skeleton width="80px" height="1.5rem" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton width="80px" height="1rem" />
        <Skeleton width="80px" height="1rem" />
        <Skeleton width="80px" height="1rem" />
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width="100px" height="0.75rem" className="mb-1" />
          <Skeleton width="48px" height="2rem" />
        </div>
        <div className="text-right">
          <Skeleton width="100px" height="0.75rem" className="mb-1 ml-auto" />
          <Skeleton width="48px" height="2rem" ml-auto />
        </div>
      </div>
    </div>
  );
}

// Full page skeleton loaders
export function CommandCenterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width="200px" height="2rem" className="mb-2" />
          <Skeleton width="280px" height="1rem" />
        </div>
        <Skeleton width="120px" height="2.5rem" />
      </div>

      {/* Attention Panel */}
      <div className="border rounded-lg p-4 bg-card">
        <Skeleton width="180px" height="1.5rem" className="mb-4" />
        <div className="grid gap-3 md:grid-cols-3">
          <SkeletonAttentionCard />
          <SkeletonAttentionCard />
          <SkeletonAttentionCard />
        </div>
      </div>

      {/* Squad Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonSquadCard />
        <SkeletonSquadCard />
      </div>

      {/* Activity */}
      <div className="border rounded-lg p-4 bg-card">
        <Skeleton width="160px" height="1.5rem" className="mb-4" />
        <div className="space-y-2">
          <SkeletonActivityRow />
          <SkeletonActivityRow />
          <SkeletonActivityRow />
          <SkeletonActivityRow />
          <SkeletonActivityRow />
        </div>
      </div>
    </div>
  );
}
