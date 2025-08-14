// app/review/page.tsx
// @ts-expect-error - valid in Next.js app router
export const dynamic = 'force-dynamic';
export const revalidate = false;
// @ts-expect-error - valid in Next.js app router
import dynamic from 'next/dynamic';
// @ts-expect-error - valid in Next.js app router
const ReviewClient = dynamic(() => import('./review-client'), { ssr: false });

export default function ReviewPage() {
  return <ReviewClient />;
}
