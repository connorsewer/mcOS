import ActivityPageClient from './page-client';
import { ClientOnly } from '@/components/client-only';

export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-20 bg-gray-200 animate-pulse rounded" />
        <div className="h-20 bg-gray-200 animate-pulse rounded" />
        <div className="h-20 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <ClientOnly fallback={<LoadingFallback />}>
      <ActivityPageClient />
    </ClientOnly>
  );
}
