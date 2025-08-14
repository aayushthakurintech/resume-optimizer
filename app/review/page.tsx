// app/review/page.tsx

export const dynamic = 'force-dynamic';
export const revalidate = false;


const ReviewClient = (await import('./review-client')).default;

export default function ReviewPage() {
  return <ReviewClient />;
}
