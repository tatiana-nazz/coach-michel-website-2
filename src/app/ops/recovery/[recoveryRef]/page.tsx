import { RecoveryPage } from '@/features/operations/runtime/server-pages';

export default async function Page({ params }: { params: Promise<{ recoveryRef: string }> }) {
  const { recoveryRef } = await params;
  return <RecoveryPage incidentRef={recoveryRef} />;
}
