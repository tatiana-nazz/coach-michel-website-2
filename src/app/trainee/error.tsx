'use client';

import styles from '@/features/trainee/runtime/trainee.module.css';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.loading}>
      <div role="alert">
        <h1>Training space unavailable</h1>
        <p>We couldn’t load your training information. Please try again.</p>
        <p lang="ar" dir="rtl">
          تعذر تحميل معلومات التدريب. يرجى المحاولة مجدداً.
        </p>
      </div>
      <button type="button" className={styles.button} onClick={reset}>
        Try again / حاول مجدداً
      </button>
    </div>
  );
}
