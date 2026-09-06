import { CoachScreen } from '@/features/coach/runtime/screens';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ sessionRef: string }> }) {
  const { sessionRef } = await params;
  return <CoachScreen section="prepare" reference={sessionRef} />;
}
