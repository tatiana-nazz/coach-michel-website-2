import { CoachScreen } from '@/features/coach/runtime/screens';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <CoachScreen section="trainees" query={typeof q === 'string' ? q.slice(0, 100) : ''} />;
}
