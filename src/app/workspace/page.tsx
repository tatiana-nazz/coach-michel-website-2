import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import styles from '@/features/website/access.module.css';
export default async function WorkspacePage() {
  const locale = await websiteLocale();
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect('/access');
  const ar = locale === 'ar';
  return (
    <SiteShell locale={locale} path="/workspace">
      <main id="main-content" className={styles.help}>
        <h1>{ar ? 'تم تسجيل الدخول.' : 'You are signed in.'}</h1>
        <p>
          {ar
            ? 'مساحة التدريب قيد الإعداد. لم تُفعّل الجلسات لهذا الإصدار بعد.'
            : 'The training workspace is being prepared. Session workflows are not enabled in this version yet.'}
        </p>
        <p>
          {ar
            ? 'يمكنك الاطلاع على دليل التدريب أو تسجيل الخروج.'
            : 'You can explore the training guide or sign out.'}
        </p>
        <Link href="/guidance">{ar ? 'دليل التدريب' : 'Training guide'}</Link>
        <form action="/access/logout" method="post">
          <button className={styles.submit} type="submit">
            {ar ? 'تسجيل الخروج' : 'Sign out'}
          </button>
        </form>
      </main>
    </SiteShell>
  );
}
