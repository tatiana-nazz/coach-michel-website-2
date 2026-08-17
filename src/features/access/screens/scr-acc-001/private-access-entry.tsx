'use client';

import { useEffect, useState, type FormEvent } from 'react';

import type { SupportedLocale } from '@/i18n/config';
import { browserApiClient } from '@/platform/api/browser-client';
import type { ApiClient, StableApiErrorCode } from '@/platform/api/client';
import { ESTABLISH_SESSION_OPERATION_ID } from '@/platform/api/operations';

import {
  getPrivateAccessEntryViewModel,
  type PrivateAccessEntryStatus,
} from './private-access-entry.model';
import styles from './private-access-entry.module.css';

export interface PrivateAccessEntryProps {
  readonly locale?: SupportedLocale;
  readonly status?: PrivateAccessEntryStatus;
  readonly defaultEmail?: string;
  readonly apiClient?: ApiClient;
}

interface EstablishSessionResponse {
  readonly status: 'authenticated';
}

interface EstablishSessionRequest {
  readonly email: string;
  readonly password: string;
}

const statusToneClass = {
  info: styles.statusInfo,
  danger: styles.statusDanger,
  warning: styles.statusWarning,
  success: styles.statusSuccess,
} as const;

function statusForStableCode(code: StableApiErrorCode | undefined): PrivateAccessEntryStatus {
  switch (code) {
    case 'VALIDATION_FAILED':
      return 'validation_error';
    case 'AUTHENTICATION_REQUIRED_OR_INVALID':
      return 'authentication_required';
    case 'AUTHORITY_DENIED':
      return 'denied';
    case 'RATE_LIMITED':
    case 'DEPENDENCY_UNAVAILABLE':
    case 'RESOURCE_NOT_FOUND_OR_UNAVAILABLE':
    case 'STALE_OR_CONFLICTING_STATE':
    case undefined:
      return 'unavailable';
  }
}

export function PrivateAccessEntry({
  locale = 'en',
  status = 'default',
  defaultEmail,
  apiClient = browserApiClient,
}: PrivateAccessEntryProps) {
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>(locale);
  const [activeStatus, setActiveStatus] = useState<PrivateAccessEntryStatus>(status);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setActiveStatus(status);
  }, [status]);

  const viewModel = getPrivateAccessEntryViewModel(activeLocale, activeStatus);
  const { copy } = viewModel;
  const credentialStateInvalid =
    activeStatus === 'validation_error' || activeStatus === 'authentication_required';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (typeof email !== 'string' || email.length === 0 || typeof password !== 'string' || password.length === 0) {
      setActiveStatus('validation_error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiClient.execute<EstablishSessionResponse, EstablishSessionRequest>({
        operationId: ESTABLISH_SESSION_OPERATION_ID,
        body: { email, password },
      });

      if (result.ok) {
        setActiveStatus(result.data.status === 'authenticated' ? 'authenticated' : 'unavailable');
      } else {
        setActiveStatus(statusForStableCode(result.error.stableCode));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-ACC-001"
      data-implementation-stage="P4-S08"
      dir={viewModel.direction}
      lang={activeLocale}
      aria-labelledby="private-access-title"
    >
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <p className={styles.brand}>COACH MICHEL</p>
          <label className={styles.localeControl}>
            <span>{copy.languageLabel}</span>
            <select
              name="locale"
              value={activeLocale}
              aria-label={copy.languageLabel}
              onChange={(event) => setActiveLocale(event.currentTarget.value as SupportedLocale)}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </label>
        </header>

        <div className={styles.workspace}>
          <div className={styles.primaryRegion}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 id="private-access-title">{copy.title}</h1>
            <p className={styles.invitedNotice}>{copy.invitedNotice}</p>

            <div
              className={`${styles.status} ${statusToneClass[viewModel.statusTone]}`}
              role={viewModel.statusRole}
              aria-live={viewModel.statusRole === 'status' ? 'polite' : undefined}
              id="private-access-status"
            >
              <span className={styles.statusMarker} aria-hidden="true" />
              <span>{viewModel.statusMessage}</span>
            </div>

            {viewModel.showCredentialForm ? (
              <form
                className={styles.form}
                aria-describedby="private-access-status"
                aria-busy={submitting}
                onSubmit={handleSubmit}
              >
                <div className={styles.field}>
                  <label htmlFor="private-access-email">{copy.emailLabel}</label>
                  <input
                    id="private-access-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    defaultValue={defaultEmail}
                    dir="ltr"
                    required
                    aria-invalid={credentialStateInvalid}
                    aria-describedby="private-access-status"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="private-access-password">{copy.passwordLabel}</label>
                  <input
                    id="private-access-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={credentialStateInvalid}
                    aria-describedby="private-access-status"
                  />
                </div>

                <button className={styles.primaryAction} type="submit" disabled={submitting}>
                  {submitting ? copy.submittingLabel : copy.submitLabel}
                </button>
              </form>
            ) : (
              <div className={styles.outcome} aria-labelledby="private-access-outcome-title">
                <h2 id="private-access-outcome-title">{viewModel.outcomeTitle}</h2>
                <p>{viewModel.outcomeBody}</p>
              </div>
            )}

            <p className={styles.identityNotice}>{copy.identityNotice}</p>

            {viewModel.showCredentialForm ? (
              <details className={styles.help}>
                <summary>{copy.helpSummary}</summary>
                <div className={styles.helpBody}>
                  <section>
                    <h2>{copy.recoveryTitle}</h2>
                    <p>{copy.recoveryText}</p>
                  </section>
                  <section>
                    <h2>{copy.privacyTitle}</h2>
                    <p>{copy.privacyText}</p>
                  </section>
                  <section>
                    <div className={styles.supportHeading}>
                      <h2>{copy.supportTitle}</h2>
                      <span>{copy.supportExternalLabel}</span>
                    </div>
                    <p>{copy.supportText}</p>
                  </section>
                </div>
              </details>
            ) : null}
          </div>

          <aside className={styles.contextRegion} aria-label={copy.contextEyebrow}>
            <span className={styles.measurementRail} aria-hidden="true" />
            <p className={styles.contextEyebrow}>{copy.contextEyebrow}</p>
            <h2>{copy.contextTitle}</h2>
            <p>{copy.contextBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
