import { IncidentsPage } from '@/features/operations/runtime/server-pages';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset } = await searchParams;
  return <IncidentsPage offset={Number(offset ?? 0)} />;
}
