import { Suspense } from 'react';
import LivePageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function LoadingFallback() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LivePageClient />
    </Suspense>
  );
}
