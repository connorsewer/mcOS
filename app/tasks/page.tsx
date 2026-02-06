import { Suspense } from 'react';
import TasksPageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksPageClient />
    </Suspense>
  );
}
