'use client';

import type { FormEvent } from 'react';

import type { SupportedLocale } from '@/i18n/config';

import {
  createFirstLoginNoticeIntent,
  getFirstLoginNoticesAcceptanceViewModel,
  type FirstLoginNoticeResponse,
  type FirstLoginNoticesAcceptanceContent,
  type FirstLoginNoticesAcceptanceCopy,
  type FirstLoginNoticesAcceptanceState,
  type FirstLoginNoticesReferences,
  type FirstLoginNoticeIntent,
} from './first-login-notices-acceptance.model';
import styles from './first-login-notices-acceptance.module.css';

export interface FirstLoginNoticesAcceptanceProps {
  readonly locale: SupportedLocale;
  readonly state: FirstLoginNoticesAcceptanceState;
  readonly copy: FirstLoginNoticesAcceptanceCopy;
  readonly content: FirstLoginNoticesAcceptanceContent;
  readonly references: FirstLoginNoticesReferences;
  readonly allowedResponses: readonly FirstLoginNoticeResponse[];
  readonly onIntent: (intent: FirstLoginNoticeIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function FirstLoginNoticesAcceptance({
  locale,
  state,
  copy,
  content,
  references,
  allowedResponses,
  onIntent,
}: FirstLoginNoticesAcceptanceProps) {
  const viewModel = getFirstLoginNoticesAcceptanceViewModel(locale, state, references);
  const stateMessage = copy.feedback[state];

  function preventTransport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function emitIntent(response: FirstLoginNoticeResponse) {
    if (viewModel.actionsEnabled) {
      onIntent(createFirstLoginNoticeIntent(response, references));
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-ACC-003"
      data-access-boundary="AUTHENTICATION_BOUNDARY"
      data-role-visibility="ROL-001 ROL-002 ROL-003 ROL-004"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="first-login-notices-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="first-login-notices-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="first-login-authority-heading"
          >
            <h2 id="first-login-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="first-login-version-heading"
          >
            <h2 id="first-login-version-heading">{copy.versionHeading}</h2>
            <bdi className={styles.reference} dir="ltr">
              {references.disclosureVersionReference}
            </bdi>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="first-login-notices-heading"
          >
            <h2 id="first-login-notices-heading">{copy.noticesHeading}</h2>
            {viewModel.showNotices ? (
              <div className={styles.noticeList}>
                {content.notices.map((notice) => (
                  <article className={styles.notice} key={notice.noticeReference}>
                    <bdi className={styles.reference} dir="ltr">
                      {notice.noticeReference}
                    </bdi>
                    <h3>{notice.heading}</h3>
                    <p>{notice.body}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="first-login-actions-heading"
          >
            <h2 id="first-login-actions-heading">{copy.actionsHeading}</h2>
            <p>{content.consequenceBody}</p>
            <form
              className={styles.actions}
              aria-describedby="first-login-feedback"
              aria-busy={state === 'pending'}
              onSubmit={preventTransport}
            >
              {allowedResponses.map((response) => (
                <button
                  className={response === 'accept' ? styles.primaryAction : styles.secondaryAction}
                  key={response}
                  type="submit"
                  disabled={!viewModel.actionsEnabled}
                  onClick={() => emitIntent(response)}
                >
                  {copy.responseLabels[response]}
                </button>
              ))}
            </form>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="validation-feedback"
            data-presentation-state={state}
            data-durable-outcome={viewModel.durableOutcome}
            aria-labelledby="first-login-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="first-login-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="first-login-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="first-login-help-heading"
          >
            <h2 id="first-login-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
