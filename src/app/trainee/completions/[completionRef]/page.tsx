import { TraineePage } from '@/features/trainee/runtime/pages';

export default async function Page({ params }: { params: Promise<{ completionRef: string }> }) {
  const references = await params;
  return <TraineePage kind="confirmation" {...references} />;
}
