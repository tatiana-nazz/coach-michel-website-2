import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import { RecoveryForm } from '@/features/website/access-lifecycle';
import styles from '@/features/website/access.module.css';
export default async function RecoveryPage() {
  const locale = await websiteLocale();
  const ar = locale === 'ar';
  return (
    <SiteShell locale={locale} path="/access/recovery">
      <main id="main-content" className={styles.help}>
        <p className={styles.eyebrow}>{ar ? 'استرداد الحساب' : 'ACCOUNT RECOVERY'}</p>
        <h1>{ar ? 'لنُعِدك إلى تدريبك.' : 'Find your way back.'}</h1>
        <p>
          {ar
            ? 'أدخل البريد الإلكتروني المرتبط بدعوتك لاستلام رابط آمن لتعيين كلمة مرور جديدة.'
            : 'Enter the email address associated with your invitation to request a secure password reset link.'}
        </p>
        <RecoveryForm locale={locale} />
      </main>
    </SiteShell>
  );
}
