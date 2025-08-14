// app/review/page.tsx

export const dynamic = 'force-dynamic';
export const revalidate = false;

import dynamic from 'next/dynamic';

// ✅ this is the safest way
const ReviewClient = dynamic(() => import('./review-client'), { ssr: false });

export default function ReviewPage() {
  return <ReviewClient />;
}
