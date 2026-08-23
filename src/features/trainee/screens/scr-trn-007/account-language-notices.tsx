'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createAccountLanguageNoticesIntent,
  getAccountLanguageNoticesViewModel,
  isAccountLanguageNoticesIntentEnabled,
  type AccountLanguageNoticesContent,
  type AccountLanguageNoticesCopy,
  type AccountLanguageNoticesIntent,
  type AccountLanguageNoticesIntentKind,
  type AccountLanguageNoticesPresentationOption,
  type AccountLanguageNoticesSnapshot,
  type AccountLanguageNoticesState,
  type AccountLanguageNoticesVisibility,
} from './account-language-notices.model';
import styles from './account-language-notices.module.css';

export interface AccountLanguageNoticesProps {
  readonly locale: SupportedLocale;
  readonly state: AccountLanguageNoticesState;
  readonly snapshot: AccountLanguageNoticesSnapshot;
  readonly presentationOptions: readonly AccountLanguageNoticesPresentationOption[];
  readonly copy: AccountLanguageNoticesCopy;
  readonly content: AccountLanguageNoticesContent;
  readonly visibility: AccountLanguageNoticesVisibility;
  readonly onPresentationLocaleChange: (locale: SupportedLocale) => void;
  readonly onIntent: (intent: AccountLanguageNoticesIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function AccountLanguageNotices({
  locale,
  state,
  snapshot,
  presentationOptions,
  copy,
  content,
  visibility,
  onPresentationLocaleChange,
  onIntent,
}: AccountLanguageNoticesProps) {
  const viewModel = getAccountLanguageNoticesViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];

  function emitIntent(kind: AccountLanguageNoticesIntentKind) {
    if (!isAccountLanguageNoticesIntentEnabled(state, kind, snapshot)) {
      return;
    }

    const intent = createAccountLanguageNoticesIntent(kind, snapshot);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-007"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-001 ROL-002 ROL-003 ROL-004"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="account-language-notices-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="account-language-notices-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="account-context"
            aria-labelledby="account-language-account-heading"
          >
            <h2 id="account-language-account-heading">{copy.accountHeading}</h2>
            <p>{content.accountBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.accountReference}
            </bdi>
            {snapshot.boundedPrincipalContext ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.boundedPrincipalContext}
              </bdi>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="account-language-authority-heading"
          >
            <h2 id="account-language-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.authorityStatusReference}
            </bdi>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="account-language-presentation-heading"
          >
            <h2 id="account-language-presentation-heading">{copy.languageHeading}</h2>
            <p>{content.languageBody}</p>
            <label className={styles.controlLabel} htmlFor="account-language-presentation">
              {copy.languageLabel}
            </label>
            <select
              className={styles.select}
              id="account-language-presentation"
              value={locale}
              disabled={!viewModel.presentationSelectionEnabled}
              aria-describedby="account-language-feedback"
              aria-invalid={state === 'validation_error'}
              onChange={(event) =>
                onPresentationLocaleChange(event.currentTarget.value as SupportedLocale)
              }
            >
              {presentationOptions.map((option) => (
                <option key={option.locale} value={option.locale}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="account-language-notices-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="account-language-notices-heading">{copy.noticesHeading}</h2>
            {viewModel.showNotices ? (
              <ul className={styles.noticeList}>
                {snapshot.notices.map((notice) => (
                  <li className={styles.notice} key={notice.noticeReference}>
                    <h3>{notice.heading}</h3>
                    <p>{notice.body}</p>
                    <bdi className={styles.reference} dir="ltr">
                      {notice.noticeReference}
                    </bdi>
                    {notice.effectiveReference ? (
                      <bdi className={styles.reference} dir="ltr">
                        {notice.effectiveReference}
                      </bdi>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="notice-consequences"
            aria-labelledby="account-language-consequences-heading"
          >
            <h2 id="account-language-consequences-heading">{copy.consequencesHeading}</h2>
            <p>
              {viewModel.authoritativeFinal
                ? content.authoritativeFinalConsequenceBody
                : content.localConsequenceBody}
            </p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="account-language-actions-heading"
          >
            <h2 id="account-language-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'refresh_notices' ? styles.primaryAction : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={!isAccountLanguageNoticesIntentEnabled(state, kind, snapshot)}
                  onClick={() => emitIntent(kind)}
                >
                  {copy.intentLabels[kind]}
                </button>
              ))}
            </div>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="validation-feedback"
            data-presentation-state={state}
            aria-labelledby="account-language-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="account-language-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="account-language-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="account-language-help-heading"
          >
            <h2 id="account-language-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
