'use client';

import { useState } from 'react';

import type { SupportedLocale } from '@/i18n/config';

import {
  getPrivateAccessEntryViewModel,
  type PrivateAccessEntryStatus,
} from './private-access-entry.model';
import styles from './private-access-entry.module.css';

export interface PrivateAccessEntryProps {
  readonly locale?: SupportedLocale;
  readonly status?: PrivateAccessEntryStatus;
  readonly defaultEmail?: string;
}

const statusToneClass = {
  info: styles.statusInfo,
  danger: styles.statusDanger,
  warning: styles.statusWarning,
  success: styles.statusSuccess,
} as const;

export function PrivateAccessEntry({
  locale = 'en',
  status = 'default',
  defaultEmail,
}: PrivateAccessEntryProps) {
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>(locale);
  const viewModel = getPrivateAccessEntryViewModel(activeLocale, status);
  const { copy } = viewModel;
  const credentialStateInvalid =
    status === 'validation_error' || status === 'authentication_required';

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-ACC-001"
      data-implementation-stage="P4-S06"
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
              <form className={styles.form} aria-describedby="private-access-status">
                <div className={styles.field}>
                  <label htmlFor="private-access-email">{copy.emailLabel}</label>
                  <input
                    id="private-access-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    defaultValue={defaultEmail}
                    dir="ltr"
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
                    aria-invalid={credentialStateInvalid}
                    aria-describedby="private-access-status"
                  />
                </div>

                <button className={styles.primaryAction} type="button">
                  {copy.submitLabel}
                </button>
              </form>
            ) : (
              <div className={styles.outcome} aria-labelledby="private-access-recovered-title">
                <h2 id="private-access-recovered-title">{copy.recoveredTitle}</h2>
                <p>{copy.recoveredBody}</p>
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
