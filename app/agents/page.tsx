import { Suspense } from 'react';
import AgentsPageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AgentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentsPageClient />
    </Suspense>
  );
}
