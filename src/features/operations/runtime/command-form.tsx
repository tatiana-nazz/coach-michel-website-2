'use client';

import Link from 'next/link';
import { useId, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { SupportedLocale } from '@/i18n/config';
import type { ApiFailure } from '@/platform/api/client';
import { browserApiClient } from '@/platform/api/browser-client';
import styles from './operations.module.css';

type FormKind = 'incident' | 'recovery' | 'validation' | 'handoff' | 'support';
interface Props {
  kind: FormKind;
  locale: SupportedLocale;
  reference?: string;
  expectedStatus?: string;
}
function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function failureMessage(error: ApiFailure, ar: boolean): string {
  if (error.kind === 'unauthorized')
    return ar
      ? 'انتهت الجلسة. سجّل الدخول ثم حاول مجدداً.'
      : 'Your session has ended. Sign in and try again.';
  if (error.kind === 'forbidden')
    return ar
      ? 'لا تملك الصلاحية المطلوبة أو لا يتحقق شرط الاستقلالية.'
      : 'Your scope does not permit this action, or the independence requirement is not met.';
  if (error.kind === 'conflict')
    return ar
      ? 'تغيرت الحالة أو سُجل هذا الإجراء مسبقاً. راجع الحالة الحالية قبل إعادة المحاولة.'
      : 'The state changed or this action was already recorded. Review the current state before trying again.';
  if (error.kind === 'validation')
    return ar
      ? 'تحقق من الحقول والمراجع المطلوبة. لا ترسل بيانات شخصية غير ضرورية.'
      : 'Check the required fields and references. Include only necessary information.';
  return ar
    ? 'تعذر تأكيد الحفظ. حدّث الصفحة للتحقق من الحالة قبل إعادة الإرسال.'
    : 'We could not confirm this was saved. Refresh to check the current state before submitting again.';
}

export function OperationsCommandForm({ kind, locale, reference, expectedStatus }: Props) {
  const ar = locale === 'ar';
  const id = useId();
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; message: string; href?: string }>();
  const label = (en: string, arabic: string) => (ar ? arabic : en);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setFeedback(undefined);
    const form = new FormData(event.currentTarget);
    const summary = String(form.get('summary') ?? '').trim();
    const evidence = { summary, references: lines(form.get('evidence')) };
    const definitions = {
      incident: {
        operationId: 'p3s11_apin_040_intake',
        body: {
          classificationRef: String(form.get('category')),
          affectedReferences: lines(form.get('targets')),
          evidence,
        },
      },
      recovery: {
        operationId: 'p3s11_apin_041_post_1',
        pathParams: { incident_ref: reference ?? '' },
        body: {
          activityIntent: {
            category: String(form.get('category')),
            reason: String(form.get('reason') ?? '').trim(),
          },
          evidence,
        },
      },
      validation: {
        operationId: 'p3s11_apin_042_submit_validation',
        pathParams: { recovery_activity_ref: reference ?? '' },
        body: { result: String(form.get('category')), evidence },
      },
      handoff: {
        operationId: 'p3s11_apin_043_post_1',
        pathParams: { validation_ref: reference ?? '' },
        body: {
          targetReferences: lines(form.get('targets')),
          reason: String(form.get('reason') ?? '').trim(),
        },
      },
      support: {
        operationId: 'p3s11_apin_039_patch_1',
        pathParams: { case_ref: reference ?? '' },
        body: {
          status: String(form.get('category')),
          expectedStatus: expectedStatus ?? '',
          reason: summary,
          evidence: lines(form.get('evidence')),
        },
      },
    };
    const result = await browserApiClient.execute<{ incidentRef?: string; validationRef?: string }>(
      definitions[kind],
    );
    if (!result.ok) setFeedback({ error: true, message: failureMessage(result.error, ar) });
    else {
      const href = result.data.incidentRef
        ? `/ops/recovery/${encodeURIComponent(result.data.incidentRef)}`
        : result.data.validationRef
          ? `/ops/reconciliation/${encodeURIComponent(result.data.validationRef)}`
          : undefined;
      setFeedback({
        error: false,
        message: label(
          'Recorded. The current server state is shown below.',
          'تم التسجيل. تظهر الحالة الحالية المحفوظة أدناه.',
        ),
        ...(href ? { href } : {}),
      });
      router.refresh();
    }
    submitting.current = false;
    setBusy(false);
  }

  const options: Record<Exclude<FormKind, 'handoff'>, [string, string, string][]> = {
    incident: [
      ['availability', 'Availability', 'التوفر'],
      ['access', 'Access', 'الوصول'],
      ['data-integrity', 'Data integrity', 'سلامة البيانات'],
      ['privacy', 'Privacy', 'الخصوصية'],
      ['other', 'Other', 'أخرى'],
    ],
    recovery: [
      ['investigation', 'Investigation', 'التحقيق'],
      ['restoration', 'Restoration evidence', 'أدلة الاستعادة'],
      ['verification', 'Verification', 'التحقق'],
    ],
    validation: [
      ['PASS', 'Passed checks', 'اجتازت الفحوصات'],
      ['FAIL', 'Failed checks', 'لم تجتز الفحوصات'],
      ['INCONCLUSIVE', 'Inconclusive', 'غير حاسمة'],
    ],
    support: [
      ['IN_REVIEW', 'In review', 'قيد المراجعة'],
      ['ESCALATED', 'Escalated', 'تم التصعيد'],
      ['RESOLVED', 'Resolved', 'تم الحل'],
    ],
  };
  return (
    <form className={styles.form} onSubmit={submit}>
      {kind !== 'handoff' && (
        <label className={styles.field} htmlFor={`${id}-category`}>
          {label(
            kind === 'validation'
              ? 'Validation result'
              : kind === 'support'
                ? 'Next status'
                : 'Category',
            kind === 'validation'
              ? 'نتيجة التحقق'
              : kind === 'support'
                ? 'الحالة التالية'
                : 'الفئة',
          )}
          <select id={`${id}-category`} name="category" required defaultValue="">
            <option value="" disabled>
              {label('Choose an option', 'اختر خياراً')}
            </option>
            {options[kind].map(([value, en, arabic]) => (
              <option key={value} value={value}>
                {ar ? arabic : en}
              </option>
            ))}
          </select>
        </label>
      )}
      {kind !== 'handoff' && (
        <label className={styles.field} htmlFor={`${id}-summary`}>
          {label(
            kind === 'validation'
              ? 'Checks performed and findings'
              : kind === 'support'
                ? 'Handling reason'
                : 'Evidence summary',
            kind === 'validation'
              ? 'الفحوصات والنتائج'
              : kind === 'support'
                ? 'سبب المعالجة'
                : 'ملخص الأدلة',
          )}
          <textarea id={`${id}-summary`} name="summary" required maxLength={2000} />
          <small>
            {label(
              'Describe only the facts needed to review this action. Do not include passwords or unnecessary personal information.',
              'اذكر الحقائق اللازمة لمراجعة هذا الإجراء فقط. لا تُدخل كلمات مرور أو بيانات شخصية غير ضرورية.',
            )}
          </small>
        </label>
      )}
      {(kind === 'recovery' || kind === 'handoff') && (
        <label className={styles.field} htmlFor={`${id}-reason`}>
          {label('Reason', 'السبب')}
          <textarea id={`${id}-reason`} name="reason" required maxLength={2000} />
        </label>
      )}
      {kind !== 'handoff' && (
        <label className={styles.field} htmlFor={`${id}-evidence`}>
          {label('Evidence references', 'مراجع الأدلة')}
          <textarea
            id={`${id}-evidence`}
            name="evidence"
            dir="ltr"
            required={kind !== 'incident'}
            maxLength={6000}
            aria-describedby={`${id}-evidence-hint`}
          />
          <small id={`${id}-evidence-hint`}>
            {label(
              'One existing evidence reference per line. Files and external systems are not changed by this form.',
              'مرجع دليل موجود في كل سطر. لا يغيّر هذا النموذج الملفات أو الأنظمة الخارجية.',
            )}
          </small>
        </label>
      )}
      {(kind === 'incident' || kind === 'handoff') && (
        <label className={styles.field} htmlFor={`${id}-targets`}>
          {label('Affected references', 'المراجع المتأثرة')}
          <textarea
            id={`${id}-targets`}
            name="targets"
            dir="ltr"
            required={kind === 'handoff'}
            maxLength={6000}
          />
          <small>
            {label(
              'One authorized incident, subject or schedule reference per line.',
              'مرجع حادثة أو متدرب أو موعد ضمن صلاحيتك في كل سطر.',
            )}
          </small>
        </label>
      )}
      <button type="submit" disabled={busy}>
        {busy
          ? label('Saving…', 'جارٍ الحفظ…')
          : label(
              kind === 'incident'
                ? 'Record incident'
                : kind === 'recovery'
                  ? 'Record recovery activity'
                  : kind === 'validation'
                    ? 'Submit validation'
                    : kind === 'support'
                      ? 'Update case'
                      : 'Create reconciliation handoff',
              kind === 'incident'
                ? 'تسجيل حادثة'
                : kind === 'recovery'
                  ? 'تسجيل نشاط الاستعادة'
                  : kind === 'validation'
                    ? 'إرسال التحقق'
                    : kind === 'support'
                      ? 'تحديث الطلب'
                      : 'إنشاء إحالة للمطابقة',
            )}
      </button>
      {feedback && (
        <div
          role={feedback.error ? 'alert' : 'status'}
          className={`${styles.feedback} ${feedback.error ? styles.error : ''}`}
        >
          {feedback.message}
          {feedback.href && (
            <div>
              <Link className={styles.link} href={feedback.href}>
                {label('Open record', 'فتح السجل')}
              </Link>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
