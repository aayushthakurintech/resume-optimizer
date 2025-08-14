// app/review/page.tsx
// ✅ This disables static export and avoids revalidate conflicts
export const dynamic = 'force-dynamic';

// ❌ REMOVE this line if present anywhere: export const revalidate = false;
// 🔁 Instead, use below to avoid triggering the build bug
export const fetchCache = 'force-no-store'; // ✅ Supported alternative

import dynamic from 'next/dynamic';
const ReviewClient = dynamic(() => import('./review-client'), { ssr: false });

export default function ReviewPage() {
  return <ReviewClient />;
}
