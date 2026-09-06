import type { Metadata } from 'next';
import { PublicPage } from '@/features/website/public-page';
import { websiteLocale } from '@/features/website/locale';
export const metadata: Metadata = { title: 'Privacy & use' };
export default async function Page() {
  return <PublicPage locale={await websiteLocale()} kind="disclosures" />;
}
