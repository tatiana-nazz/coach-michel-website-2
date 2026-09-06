import { redirect } from 'next/navigation';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import { PasswordForm } from '@/features/website/access-lifecycle';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import styles from '@/features/website/access.module.css';
export default async function PasswordPage() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || data.user.is_anonymous) redirect('/access/error');
  const locale = await websiteLocale();
  const ar = locale === 'ar';
  return (
    <SiteShell locale={locale} path="/access/password">
      <main id="main-content" className={styles.help}>
        <p className={styles.eyebrow}>{ar ? 'دخول آمن' : 'SECURE ACCESS'}</p>
        <h1>{ar ? 'كلمة مرور خاصة بك.' : 'Make it yours.'}</h1>
        <p>
          {ar
            ? 'عيّن كلمة مرور فريدة لحسابك. لا تشاركها مع أي شخص.'
            : 'Set a unique password for your account. Keep it private.'}
        </p>
        <PasswordForm locale={locale} />
      </main>
    </SiteShell>
  );
}
