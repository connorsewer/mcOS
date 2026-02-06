import HomePageClient from './page-client';
import { ClientOnly } from '@/components/client-only';

export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="space-y-8 p-4">
      <div className="h-48 bg-gray-200 animate-pulse rounded" />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ClientOnly fallback={<LoadingFallback />}>
      <HomePageClient />
    </ClientOnly>
  );
}
