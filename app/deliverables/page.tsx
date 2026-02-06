import { Suspense } from 'react';
import DeliverablesPageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DeliverablesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeliverablesPageClient />
    </Suspense>
  );
}
