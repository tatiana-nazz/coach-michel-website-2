import type { Metadata } from 'next';
import { PublicPage } from '@/features/website/public-page';
import { websiteLocale } from '@/features/website/locale';
export const metadata: Metadata = { title: 'The approach' };
export default async function Page() {
  return <PublicPage locale={await websiteLocale()} kind="about" />;
}
