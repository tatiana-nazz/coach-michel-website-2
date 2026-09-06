import { TraineePage } from '@/features/trainee/runtime/pages';

export default async function Page({
  params,
}: {
  params: Promise<{ sessionRef: string; exerciseRef: string }>;
}) {
  const references = await params;
  return <TraineePage kind="exercise" {...references} />;
}
