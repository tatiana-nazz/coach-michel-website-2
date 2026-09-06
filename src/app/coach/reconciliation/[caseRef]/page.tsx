import { CoachScreen } from '@/features/coach/runtime/screens';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ caseRef: string }> }) {
  const { caseRef } = await params;
  return <CoachScreen section="reconciliation" reference={caseRef} />;
}
