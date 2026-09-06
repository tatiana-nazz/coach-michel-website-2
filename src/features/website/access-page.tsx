'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { Field, FeedbackPanel } from '@/design-system/components/interaction-primitives';
import { browserApiClient } from '@/platform/api/browser-client';
import { ESTABLISH_SESSION_OPERATION_ID } from '@/platform/api/operations';
import { Arrow } from './site-shell';
import styles from './access.module.css';

export function AccessForm({ locale }: { locale: SupportedLocale }) {
  const router = useRouter();
  const ar = locale === 'ar';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const result = await browserApiClient.execute<{ status: string }>({
        operationId: ESTABLISH_SESSION_OPERATION_ID,
        body: {
          email: String(data.get('email') ?? '').trim(),
          password: String(data.get('password') ?? ''),
        },
      });
      if (result.ok && result.data?.status === 'authenticated') {
        router.push('/workspace');
        router.refresh();
        return;
      }
      const invalid =
        !result.ok && result.error.stableCode === 'AUTHENTICATION_REQUIRED_OR_INVALID';
      setError(
        invalid
          ? ar
            ? 'تعذّر تسجيل الدخول. تحقّق من بريدك وكلمة المرور.'
            : 'We could not sign you in. Check your email and password.'
          : ar
            ? 'خدمة الدخول غير متاحة الآن. حاول مجددًا بعد قليل.'
            : 'Member access is unavailable right now. Please try again shortly.',
      );
    } catch {
      setError(ar ? 'تحقّق من اتصالك وحاول مجددًا.' : 'Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.layout}>
      <section className={styles.formCard}>
        <p className={styles.eyebrow}>
          {ar ? 'مساحتك التدريبية الخاصة' : 'YOUR PRIVATE TRAINING SPACE'}
        </p>
        <h1>{ar ? 'أهلًا بعودتك.' : 'Welcome back.'}</h1>
        <p className={styles.intro}>
          {ar ? 'سجّل الدخول للمتابعة من حيث توقفت.' : 'Sign in and pick up where you left off.'}
        </p>
        <form onSubmit={submit} aria-busy={busy}>
          <Field
            name="email"
            type="email"
            label={ar ? 'البريد الإلكتروني' : 'Email address'}
            autoComplete="username"
            dir="ltr"
            required
            maxLength={254}
          />
          <div className={styles.password}>
            <Field
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={ar ? 'كلمة المرور' : 'Password'}
              autoComplete="current-password"
              required
              maxLength={1024}
            />
            <button
              type="button"
              className={styles.showPassword}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (ar ? 'إخفاء' : 'Hide') : ar ? 'إظهار' : 'Show'}
            </button>
          </div>
          <Link className={styles.recoveryLink} href="/access/recovery">
            {ar ? 'تحتاج مساعدة في الدخول؟' : 'Need help signing in?'}
          </Link>
          {error ? (
            <FeedbackPanel tone="danger" title={ar ? 'تعذّر الدخول' : 'Unable to sign in'}>
              {error}
            </FeedbackPanel>
          ) : null}
          <button className={styles.submit} type="submit" disabled={busy}>
            {busy
              ? ar
                ? 'جارٍ تسجيل الدخول…'
                : 'Signing in…'
              : ar
                ? 'دخول الأعضاء'
                : 'Enter your workspace'}
            <Arrow />
          </button>
        </form>
        <p className={styles.invite}>
          {ar ? 'الدخول متاح للأعضاء المدعوين.' : 'Access is available to invited members.'}{' '}
          <Link href="/access/provisioning">{ar ? 'حول الدعوات' : 'About invitations'}</Link>
        </p>
      </section>
      <aside className={styles.context}>
        <span className={styles.contextMark} aria-hidden="true">
          M
        </span>
        <p className={styles.eyebrow}>COACH MICHEL</p>
        <h2>{ar ? 'خطّط بوضوح.\nتدرّب بتركيز.' : 'A clear plan.\nA focused mind.'}</h2>
        <p>
          {ar
            ? 'تدريبك وإرشاداتك وسجل إنجازك، في مكان واحد.'
            : 'Your training, guidance and completed work. All in one place.'}
        </p>
        <span className={styles.contextLine} />
      </aside>
    </div>
  );
}
