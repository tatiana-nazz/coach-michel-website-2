import type { Metadata } from 'next';
import { PublicPage } from '@/features/website/public-page';
import { websiteLocale } from '@/features/website/locale';
export const metadata: Metadata = { title: 'Your next step' };
export default async function Page() {
  return <PublicPage locale={await websiteLocale()} kind="next-steps" />;
}
