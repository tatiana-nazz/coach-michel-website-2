import { ReconciliationHandoffPage } from '@/features/operations/runtime/server-pages';

export default async function Page({ params }: { params: Promise<{ reconciliationRef: string }> }) {
  const { reconciliationRef } = await params;
  return <ReconciliationHandoffPage validationRef={reconciliationRef} />;
}
