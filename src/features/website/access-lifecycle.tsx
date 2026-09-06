'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { Field, FeedbackPanel } from '@/design-system/components/interaction-primitives';
import { browserApiClient } from '@/platform/api/browser-client';
import type { EffectiveNotice } from '@/platform/auth/access-context';
import styles from './access.module.css';

export function RecoveryForm({ locale }: { locale: SupportedLocale }) {
  const ar = locale === 'ar';
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    try {
      const result = await browserApiClient.execute<{ status: string }>({
        operationId: 'p3s11_apin_010_post_1',
        body: { email, requestedRecoveryPurpose: 'password_reset' },
      });
      if (result.ok && result.data?.status === 'accepted') setSent(true);
      else
        setError(
          ar
            ? 'الاسترداد غير متاح الآن. حاول مجددًا بعد قليل.'
            : 'Recovery is unavailable right now. Please try again shortly.',
        );
    } catch {
      setError(ar ? 'تحقّق من اتصالك وحاول مجددًا.' : 'Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.lifecycleForm}>
      {sent ? (
        <FeedbackPanel tone="info" title={ar ? 'تحقّق من بريدك' : 'Check your email'}>
          {ar
            ? 'إذا طابق البريد حسابًا مؤهلًا، ستصلك تعليمات الاسترداد. تحقّق من البريد غير المرغوب فيه وافتح الرابط في هذا المتصفح. إذا لم تصلك رسالة، تواصل مع مدربك عبر قناتك المعتادة.'
            : 'If an eligible account matches, you will receive recovery instructions. Check your spam folder and open the link in this browser. If no email arrives, contact your coach through your usual channel.'}
        </FeedbackPanel>
      ) : (
        <form onSubmit={submit} aria-busy={busy}>
          <Field
            name="email"
            type="email"
            label={ar ? 'البريد الإلكتروني المرتبط بالدعوة' : 'Email address on your invitation'}
            dir="ltr"
            autoComplete="email"
            required
            maxLength={254}
          />
          {error ? (
            <FeedbackPanel tone="danger" title={ar ? 'تعذّر المتابعة' : 'Unable to continue'}>
              {error}
            </FeedbackPanel>
          ) : null}
          <button className={styles.submit} type="submit" disabled={busy}>
            {busy
              ? ar
                ? 'جارٍ الإرسال…'
                : 'Submitting…'
              : ar
                ? 'طلب رابط الاسترداد'
                : 'Request a recovery link'}
          </button>
        </form>
      )}
      <Link href="/access">{ar ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}</Link>
    </div>
  );
}

export function PasswordForm({ locale }: { locale: SupportedLocale }) {
  const router = useRouter();
  const ar = locale === 'ar';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password !== form.get('confirmation')) {
      setError(ar ? 'كلمتا المرور غير متطابقتين.' : 'The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const result = await fetch('/access/password/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      const data: unknown = await result.json();
      if (
        result.ok &&
        typeof data === 'object' &&
        data !== null &&
        'status' in data &&
        data.status === 'updated'
      ) {
        setDone(true);
        router.refresh();
      } else
        setError(
          ar
            ? 'تعذّر تحديث كلمة المرور. اختر كلمة مرور جديدة من 12 حرفًا على الأقل، أو اطلب رابط استرداد جديدًا.'
            : 'The password could not be updated. Choose a new password of at least 12 characters, or request a fresh recovery link.',
        );
    } catch {
      setError(ar ? 'تحقّق من اتصالك وحاول مجددًا.' : 'Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <div className={styles.lifecycleForm}>
        <FeedbackPanel tone="success" title={ar ? 'تم تحديث كلمة المرور' : 'Password updated'}>
          {ar ? 'كلمة المرور الجديدة جاهزة للاستخدام.' : 'Your new password is ready to use.'}
        </FeedbackPanel>
        <Link href="/workspace">
          {ar ? 'متابعة إلى مساحة التدريب' : 'Continue to your workspace'}
        </Link>
      </div>
    );
  return (
    <form className={styles.lifecycleForm} onSubmit={submit} aria-busy={busy}>
      <Field
        name="password"
        type="password"
        label={ar ? 'كلمة المرور الجديدة' : 'New password'}
        hint={
          ar
            ? 'استخدم عبارة فريدة من 12 إلى 128 حرفًا.'
            : 'Use a unique passphrase between 12 and 128 characters.'
        }
        autoComplete="new-password"
        required
        minLength={12}
        maxLength={128}
      />
      <Field
        name="confirmation"
        type="password"
        label={ar ? 'تأكيد كلمة المرور' : 'Confirm password'}
        autoComplete="new-password"
        required
        minLength={12}
        maxLength={128}
      />
      {error ? (
        <FeedbackPanel tone="danger" title={ar ? 'تعذّر المتابعة' : 'Unable to continue'}>
          {error}
        </FeedbackPanel>
      ) : null}
      <button className={styles.submit} type="submit" disabled={busy}>
        {busy ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : ar ? 'حفظ كلمة المرور' : 'Save password'}
      </button>
      <Link href="/access/recovery">{ar ? 'طلب رابط جديد' : 'Request a new link'}</Link>
    </form>
  );
}

export function NoticeDecisions({
  locale,
  notices,
}: {
  locale: SupportedLocale;
  notices: EffectiveNotice[];
}) {
  const ar = locale === 'ar';
  const router = useRouter();
  const [decisions, setDecisions] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      notices.map((notice) => [
        notice.versionRef,
        notice.acceptedInLocale ? 'ACCEPTED' : notice.decision === 'DECLINED' ? 'DECLINED' : '',
      ]),
    ),
  );
  const [busyRef, setBusyRef] = useState('');
  const [error, setError] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  async function decide(versionRef: string, response: 'accept' | 'decline') {
    if (busyRef || (response === 'accept' && !checked[versionRef])) return;
    setBusyRef(versionRef);
    setError('');
    try {
      const result = await browserApiClient.execute<{ decision?: string }>({
        operationId: 'p3s11_apin_009_post_1',
        body: { disclosureVersionReference: versionRef, response },
      });
      if (
        result.ok &&
        result.data?.decision === (response === 'accept' ? 'ACCEPTED' : 'DECLINED')
      ) {
        setDecisions((current) => ({ ...current, [versionRef]: result.data?.decision ?? '' }));
        router.refresh();
      } else
        setError(
          ar
            ? 'تعذّر حفظ القرار أو تغيّر إصدار الإشعار. أعد تحميل الصفحة وحاول مجددًا.'
            : 'The decision could not be saved, or the notice version changed. Reload this page and try again.',
        );
    } catch {
      setError(ar ? 'تحقّق من اتصالك وحاول مجددًا.' : 'Check your connection and try again.');
    } finally {
      setBusyRef('');
    }
  }
  const allAccepted = notices.every((notice) => decisions[notice.versionRef] === 'ACCEPTED');
  return (
    <div className={styles.lifecycleForm}>
      {notices.map((notice) => (
        <section
          key={notice.versionRef}
          className={styles.notice}
          aria-busy={busyRef === notice.versionRef}
        >
          <div lang={notice.locale} dir={notice.locale === 'ar' ? 'rtl' : 'ltr'}>
            <h2>{notice.title}</h2>
            {notice.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <p className={styles.version}>
            {ar ? 'الإصدار:' : 'Version:'} <bdi>{notice.versionRef}</bdi>
          </p>
          {decisions[notice.versionRef] === 'ACCEPTED' ? (
            <FeedbackPanel tone="success" title={ar ? 'تم حفظ الموافقة' : 'Acceptance saved'}>
              {notice.acceptedInLocale && notice.acceptedInLocale !== notice.locale
                ? ar
                  ? 'سُجلت موافقتك على الترجمة الأخرى للإصدار الحالي.'
                  : 'Your acceptance of the other translation of this current version is recorded.'
                : ar
                  ? 'سُجلت موافقتك على هذا الإصدار.'
                  : 'Your acceptance of this version is recorded.'}
            </FeedbackPanel>
          ) : (
            <>
              {decisions[notice.versionRef] === 'DECLINED' ? (
                <FeedbackPanel tone="info" title={ar ? 'تم حفظ الرفض' : 'Decline saved'}>
                  {ar
                    ? 'يمكنك تسجيل الخروج، أو مراجعة الإشعار والموافقة لاحقًا.'
                    : 'You can sign out, or review the notice and accept it later.'}
                </FeedbackPanel>
              ) : null}
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={checked[notice.versionRef] ?? false}
                  onChange={(event) =>
                    setChecked((current) => ({
                      ...current,
                      [notice.versionRef]: event.target.checked,
                    }))
                  }
                />
                <span>
                  {ar ? 'قرأت هذا الإشعار وأوافق عليه.' : 'I have read and agree to this notice.'}
                </span>
              </label>
              <div className={styles.decisionActions}>
                <button
                  type="button"
                  className={styles.submit}
                  disabled={!!busyRef || !checked[notice.versionRef]}
                  onClick={() => void decide(notice.versionRef, 'accept')}
                >
                  {busyRef === notice.versionRef
                    ? ar
                      ? 'جارٍ الحفظ…'
                      : 'Saving…'
                    : ar
                      ? 'حفظ الموافقة'
                      : 'Save acceptance'}
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={!!busyRef}
                  onClick={() => void decide(notice.versionRef, 'decline')}
                >
                  {ar ? 'لا أوافق' : 'Decline'}
                </button>
              </div>
            </>
          )}
        </section>
      ))}
      {error ? (
        <FeedbackPanel tone="danger" title={ar ? 'تعذّر حفظ القرار' : 'Decision not saved'}>
          {error}
        </FeedbackPanel>
      ) : null}
      {allAccepted ? (
        <Link className={styles.submit} href="/workspace">
          {ar ? 'متابعة إلى مساحة التدريب' : 'Continue to your workspace'}
        </Link>
      ) : (
        <p>
          {ar
            ? 'تحتاج الموافقة على الإشعارات الحالية للمتابعة إلى التدريب.'
            : 'Accept the current notices to continue to training.'}
        </p>
      )}
    </div>
  );
}
