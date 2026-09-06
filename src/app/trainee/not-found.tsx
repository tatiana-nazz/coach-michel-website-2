import Link from 'next/link';
import { websiteLocale } from '@/features/website/locale';
import { traineeCopy } from '@/features/trainee/runtime/copy';
import styles from '@/features/trainee/runtime/trainee.module.css';

export default async function NotFound() {
  const locale = await websiteLocale();
  const c = traineeCopy[locale];
  return (
    <main className={styles.loading} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h1>{c.unavailableTitle}</h1>
      <p>{c.unavailableBody}</p>
      <Link href="/trainee/sessions" className={styles.button}>
        {c.backSessions}
      </Link>
    </main>
  );
}
