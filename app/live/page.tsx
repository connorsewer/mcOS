import { Suspense } from 'react';
import LivePageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LivePageClient />
    </Suspense>
  );
}
