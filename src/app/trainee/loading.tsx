import { websiteLocale } from '@/features/website/locale';
import styles from '@/features/trainee/runtime/trainee.module.css';

export default async function Loading() {
  const locale = await websiteLocale();
  return (
    <div className={styles.loading} role="status" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <p>{locale === 'ar' ? 'جارٍ تحميل مساحتك التدريبية…' : 'Loading your training space…'}</p>
      <div className={styles.skeleton} aria-hidden="true" />
      <div className={styles.skeleton} aria-hidden="true" />
    </div>
  );
}
