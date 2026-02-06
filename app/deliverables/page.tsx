import { Suspense } from 'react';
import DeliverablesPageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function LoadingFallback() {
  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-zinc-800 animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-zinc-800 animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-zinc-800 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="h-24 bg-zinc-800 animate-pulse rounded" />
        <div className="h-24 bg-zinc-800 animate-pulse rounded" />
        <div className="h-24 bg-zinc-800 animate-pulse rounded" />
        <div className="h-24 bg-zinc-800 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function DeliverablesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DeliverablesPageClient />
    </Suspense>
  );
}
