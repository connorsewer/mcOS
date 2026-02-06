import { Suspense } from 'react';
import ApprovalsPageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApprovalsPageClient />
    </Suspense>
  );
}
