'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { browserApiClient } from '@/platform/api/browser-client';
import { traineeCopy } from './copy';
import type { CompletionResponse, SupportResponse } from './types';
import styles from './trainee.module.css';

export function RefreshStatus({ locale }: { locale: SupportedLocale }) {
  const router = useRouter();
  return (
    <button type="button" className={styles.secondary} onClick={() => router.refresh()}>
      {traineeCopy[locale].refresh}
    </button>
  );
}

export function CompletionForm({
  locale,
  scheduleRef,
}: {
  locale: SupportedLocale;
  scheduleRef: string;
}) {
  const c = traineeCopy[locale];
  const router = useRouter();
  const intent = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'failure' | 'conflict' | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    if (form.get('completed') !== 'on') return;
    intent.current ??= crypto.randomUUID();
    setBusy(true);
    setError(null);
    const result = await browserApiClient.execute<CompletionResponse>({
      operationId: 'p3s11_apin_016_post_1',
      pathParams: { schedule_ref: scheduleRef },
      body: {
        businessIntentRef: intent.current,
        clientEvidenceContext: {
          note: String(form.get('note') ?? '').trim(),
          reportedCompletedAt: new Date().toISOString(),
        },
      },
    });
    if (!result.ok) {
      setError(result.error.kind === 'conflict' ? 'conflict' : 'failure');
      setBusy(false);
      return;
    }
    // A successful intent response may still be pending. The server page reads the durable record.
    router.push(
      `/trainee/completions/${encodeURIComponent(result.data.completionRef || scheduleRef)}`,
    );
    router.refresh();
  }
  return (
    <form className={styles.form} onSubmit={submit} aria-busy={busy}>
      <div className={styles.field}>
        <label htmlFor="completion-note">
          {c.completionNote}
          <span>{c.optional}</span>
        </label>
        <textarea
          id="completion-note"
          name="note"
          maxLength={2000}
          placeholder={c.notePlaceholder}
          disabled={busy}
        />
      </div>
      <label className={styles.check}>
        <input type="checkbox" name="completed" required disabled={busy} />
        <span>{c.completionConsent}</span>
      </label>
      <p className={styles.muted}>{c.completionHelp}</p>
      {error && (
        <div role="alert" className={styles.feedback}>
          {error === 'conflict' ? c.conflict : c.error}
          {error === 'conflict' && (
            <p>
              <Link
                className={styles.link}
                href={`/trainee/completions/${encodeURIComponent(scheduleRef)}`}
              >
                {c.checkStatus}
              </Link>
            </p>
          )}
        </div>
      )}
      <button type="submit" className={styles.button} disabled={busy}>
        {busy ? c.submitting : c.submitCompletion}
      </button>
    </form>
  );
}

export function SupportForm({ locale }: { locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [receipt, setReceipt] = useState<SupportResponse | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError(false);
    const result = await browserApiClient.execute<SupportResponse>({
      operationId: 'p3s11_apin_019_post_1',
      body: {
        requestCategory: String(values.get('category')),
        minimumRoutingFacts: { message: String(values.get('message') ?? '').trim() },
        consentPurposeContext: { purpose: 'support-request' },
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(true);
      return;
    }
    setReceipt(result.data);
    router.refresh();
  }
  if (receipt)
    return (
      <div className={styles.stack}>
        <div role="status" className={styles.feedback}>
          <h3>{c.sentTitle}</h3>
          <p>{c.sentBody}</p>
          <p>
            {c.reference}: <bdi className={styles.reference}>{receipt.caseRef}</bdi>
          </p>
        </div>
        <button type="button" className={styles.secondary} onClick={() => setReceipt(null)}>
          {c.another}
        </button>
      </div>
    );
  return (
    <form className={styles.form} onSubmit={submit} aria-busy={busy}>
      <div className={styles.field}>
        <label htmlFor="support-category">{c.category}</label>
        <select id="support-category" name="category" disabled={busy} required>
          <option value="training">{c.training}</option>
          <option value="account">{c.accountCategory}</option>
          <option value="privacy">{c.privacy}</option>
          <option value="technical">{c.technical}</option>
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="support-message">{c.message}</label>
        <textarea
          id="support-message"
          name="message"
          minLength={5}
          maxLength={2000}
          required
          placeholder={c.messagePlaceholder}
          aria-describedby="support-message-help"
          disabled={busy}
        />
        <span id="support-message-help" className={styles.muted}>
          {c.messageHelp}
        </span>
      </div>
      {error && (
        <div role="alert" className={styles.feedback}>
          {c.error}
        </div>
      )}
      <button type="submit" className={styles.button} disabled={busy}>
        {busy ? c.submitting : c.send}
      </button>
    </form>
  );
}
