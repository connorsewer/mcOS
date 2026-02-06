import AgentsPageClient from './page-client';
import { ClientOnly } from '@/components/client-only';

export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <ClientOnly fallback={<LoadingFallback />}>
      <AgentsPageClient />
    </ClientOnly>
  );
}
