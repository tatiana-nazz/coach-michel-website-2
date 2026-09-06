import type { Metadata } from 'next';
import { AccessForm } from '@/features/website/access-page';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
export const metadata: Metadata = {
  title: 'Member access',
  robots: { index: false, follow: true },
};
export default async function AccessPage() {
  const locale = await websiteLocale();
  return (
    <SiteShell locale={locale} path="/access">
      <main id="main-content" data-screen-id="SCR-ACC-001">
        <AccessForm locale={locale} />
      </main>
    </SiteShell>
  );
}
