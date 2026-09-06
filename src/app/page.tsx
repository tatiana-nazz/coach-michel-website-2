import { PublicPage } from '@/features/website/public-page';
import { websiteLocale } from '@/features/website/locale';
export default async function HomePage() {
  return <PublicPage locale={await websiteLocale()} kind="home" />;
}
