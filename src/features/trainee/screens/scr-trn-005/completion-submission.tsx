'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createCompletionSubmissionIntent,
  getCompletionSubmissionViewModel,
  isCompletionSubmissionIntentEnabled,
  type CompletionSubmissionContent,
  type CompletionSubmissionContext,
  type CompletionSubmissionCopy,
  type CompletionSubmissionIntent,
  type CompletionSubmissionIntentKind,
  type CompletionSubmissionState,
  type CompletionSubmissionVisibility,
} from './completion-submission.model';
import styles from './completion-submission.module.css';

export interface CompletionSubmissionProps {
  readonly locale: SupportedLocale;
  readonly state: CompletionSubmissionState;
  readonly copy: CompletionSubmissionCopy;
  readonly content: CompletionSubmissionContent;
  readonly context: CompletionSubmissionContext;
  readonly visibility: CompletionSubmissionVisibility;
  readonly onIntent: (intent: CompletionSubmissionIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function CompletionSubmission({
  locale,
  state,
  copy,
  content,
  context,
  visibility,
  onIntent,
}: CompletionSubmissionProps) {
  const viewModel = getCompletionSubmissionViewModel(locale, state, context, visibility);
  const stateMessage = copy.feedback[state];

  function emitIntent(kind: CompletionSubmissionIntentKind) {
    if (!isCompletionSubmissionIntentEnabled(state, kind, context)) {
      return;
    }

    const intent = createCompletionSubmissionIntent(kind, context);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-005"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-003 ROL-012"
      data-selected-direction-treatment="VDR_02_PROPAGATION_NOT_AUTHORIZED_FOR_THIS_SCREEN"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="completion-submission-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="completion-submission-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="completion-submission-authority-heading"
          >
            <h2 id="completion-submission-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
          </section>

          <section
            className={styles.commandRegion}
            data-region="primary-task"
            aria-labelledby="completion-submission-command-heading"
          >
            <h2 id="completion-submission-command-heading">{copy.commandHeading}</h2>
            <p>{content.commandBody}</p>
            {viewModel.showCommandContext ? (
              <dl className={styles.referenceList}>
                <div>
                  <dt>{copy.commandHeading}</dt>
                  <dd>
                    <bdi className={styles.reference} dir="ltr">
                      {context.scheduleReference}
                    </bdi>
                  </dd>
                </div>
                <div>
                  <dt>{copy.consequenceHeading}</dt>
                  <dd>
                    <bdi className={styles.reference} dir="ltr">
                      {context.businessIntentReference}
                    </bdi>
                  </dd>
                </div>
              </dl>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.evidenceRegion}
            data-region="evidence-audit-context"
            aria-labelledby="completion-submission-evidence-heading"
          >
            <h2 id="completion-submission-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
            {viewModel.showCommandContext && context.clientEvidenceReferences.length > 0 ? (
              <ul className={styles.evidenceList}>
                {context.clientEvidenceReferences.map((reference) => (
                  <li key={reference}>
                    <bdi className={styles.reference} dir="ltr">
                      {reference}
                    </bdi>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="completion-submission-consequence-heading"
          >
            <h2 id="completion-submission-consequence-heading">{copy.consequenceHeading}</h2>
            <p>
              {viewModel.durableFinal ? content.durableFinalBody : content.localAcknowledgementBody}
            </p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="completion-submission-actions-heading"
          >
            <h2 id="completion-submission-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'submit_completion_intent'
                      ? styles.primaryAction
                      : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={!isCompletionSubmissionIntentEnabled(state, kind, context)}
                  onClick={() => emitIntent(kind)}
                >
                  {copy.intentLabels[kind]}
                </button>
              ))}
            </div>
          </section>

          <section
            className={styles.validationRegion}
            data-region="input-validation"
            aria-labelledby="completion-submission-validation-heading"
            role={viewModel.preflightIssues.length > 0 ? 'alert' : 'status'}
            aria-live={viewModel.preflightIssues.length > 0 ? 'assertive' : 'polite'}
          >
            <h2 id="completion-submission-validation-heading">{copy.validationHeading}</h2>
            {viewModel.preflightIssues.length > 0 ? (
              <ul className={styles.validationList}>
                {viewModel.preflightIssues.map((issue) => (
                  <li key={issue}>{copy.validationMessages[issue]}</li>
                ))}
              </ul>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="validation-feedback"
            data-presentation-state={state}
            aria-labelledby="completion-submission-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="completion-submission-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="completion-submission-help-heading"
          >
            <h2 id="completion-submission-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
