import { Suspense } from 'react';
import HomePageClient from './page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageClient />
    </Suspense>
  );
}
