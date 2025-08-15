// app/review/page.tsx
export const dynamic = 'force-dynamic';

// 🔁 Instead, use below to avoid triggering the build bug
export const fetchCache = 'force-no-store'; // ✅ Supported alternative

import dynamic from 'next/dynamic';
const ReviewClient = dynamic(() => import('./review-client'), { ssr: false });

export default function ReviewPage() {
  return <ReviewClient />;
}
