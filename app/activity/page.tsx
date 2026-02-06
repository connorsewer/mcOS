import { Suspense } from 'react';
import ActivityPageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ActivityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivityPageClient />
    </Suspense>
  );
}
