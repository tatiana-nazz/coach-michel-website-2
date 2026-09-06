import Link from 'next/link';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import styles from '@/features/website/access.module.css';
export default async function AccessErrorPage() {
  const locale = await websiteLocale();
  const ar = locale === 'ar';
  return (
    <SiteShell locale={locale} path="/access/error">
      <main id="main-content" className={styles.help}>
        <p className={styles.eyebrow}>{ar ? 'مساعدة الدخول' : 'ACCESS HELP'}</p>
        <h1>{ar ? 'تعذّر تأكيد هذا الرابط.' : 'This link could not be confirmed.'}</h1>
        <p>
          {ar
            ? 'قد يكون الرابط منتهي الصلاحية، أو استُخدم من قبل، أو فُتح في متصفح مختلف. اطلب رابط استرداد جديدًا وافتحه في المتصفح نفسه.'
            : 'The link may have expired, already been used, or opened in a different browser. Request a fresh recovery link and open it in the same browser.'}
        </p>
        <div className={styles.lifecycleForm}>
          <Link href="/access/recovery">{ar ? 'طلب رابط استرداد' : 'Request a recovery link'}</Link>
          <Link href="/access">{ar ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}</Link>
        </div>
      </main>
    </SiteShell>
  );
}
