import { TraineePage } from '@/features/trainee/runtime/pages';

export default async function Page({ params }: { params: Promise<{ sessionRef: string }> }) {
  const references = await params;
  return <TraineePage kind="completion" {...references} />;
}
