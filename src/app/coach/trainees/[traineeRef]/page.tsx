import { CoachScreen } from '@/features/coach/runtime/screens';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ traineeRef: string }> }) {
  const { traineeRef } = await params;
  return <CoachScreen section="trainee" reference={traineeRef} />;
}
