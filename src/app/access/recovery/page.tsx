import Link from 'next/link';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import styles from '@/features/website/access.module.css';
export default async function RecoveryPage() {
  const locale = await websiteLocale();
  const ar = locale === 'ar';
  return (
    <SiteShell locale={locale} path="/access/recovery">
      <main id="main-content" className={styles.help}>
        <p className={styles.eyebrow}>{ar ? 'مساعدة الدخول' : 'ACCESS HELP'}</p>
        <h1>{ar ? 'لنجد خطوتك التالية.' : 'Find your next step.'}</h1>
        <section>
          <h2>{ar ? 'هل استلمت دعوة؟' : 'Have an invitation?'}</h2>
          <p>
            {ar
              ? 'استخدم البريد الإلكتروني المرتبط بدعوتك. تحقّق من الرسالة الأصلية وتعليمات الدخول المرفقة بها.'
              : 'Use the email address associated with your invitation. Check the original message and its access instructions.'}
          </p>
        </section>
        <section>
          <h2>{ar ? 'تحتاج استرداد الحساب؟' : 'Need to recover your account?'}</h2>
          <p>
            {ar
              ? 'تواصل مع مدربك عبر قناة التواصل الحالية لطلب مساعدة في استرداد حسابك. لا تشارك كلمة المرور.'
              : 'Contact your coach through your existing communication channel to request account recovery assistance. Do not share your password.'}
          </p>
        </section>
        <Link href="/access">{ar ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}</Link>
      </main>
    </SiteShell>
  );
}
