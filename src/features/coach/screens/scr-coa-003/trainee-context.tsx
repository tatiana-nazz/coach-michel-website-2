'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createTraineeContextIntent,
  getTraineeContextViewModel,
  isTraineeContextIntentEnabled,
  type TraineeContextContent,
  type TraineeContextCopy,
  type TraineeContextIntent,
  type TraineeContextIntentKind,
  type TraineeContextSnapshot,
  type TraineeContextState,
  type TraineeContextSummary,
  type TraineeContextVisibility,
} from './trainee-context.model';
import styles from './trainee-context.module.css';

export interface TraineeContextProps {
  readonly locale: SupportedLocale;
  readonly state: TraineeContextState;
  readonly snapshot: TraineeContextSnapshot;
  readonly copy: TraineeContextCopy;
  readonly content: TraineeContextContent;
  readonly visibility: TraineeContextVisibility;
  readonly onIntent: (intent: TraineeContextIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function TraineeContext({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onIntent,
}: TraineeContextProps) {
  const viewModel = getTraineeContextViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: TraineeContextIntentKind, summary?: TraineeContextSummary) {
    if (!isTraineeContextIntentEnabled(state, kind, snapshot, summary)) {
      return;
    }

    const intent = createTraineeContextIntent(kind, snapshot, summary);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-003"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="trainee-context-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="trainee-context-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <bdi className={styles.reference} dir="ltr">
            {snapshot.traineeReference}
          </bdi>
          {snapshot.boundedTimeContext ? (
            <bdi className={styles.reference} dir="ltr">
              {snapshot.boundedTimeContext}
            </bdi>
          ) : null}
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="trainee-context-authority-heading"
          >
            <h2 id="trainee-context-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <div className={styles.referenceGroup}>
              <bdi className={styles.reference} dir="ltr">
                {snapshot.authorityStatusReference}
              </bdi>
              <bdi className={styles.reference} dir="ltr">
                {snapshot.lifecycleStatusReference}
              </bdi>
            </div>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="trainee-context-summaries-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="trainee-context-summaries-heading">{copy.summariesHeading}</h2>
            <p>{content.summariesBody}</p>
            {viewModel.showContext ? (
              <ul className={styles.summaryList}>
                {snapshot.summaries.map((summary) => (
                  <li
                    className={styles.summary}
                    data-summary-category={summary.category}
                    key={summary.summaryReference}
                  >
                    <h3>{summary.heading}</h3>
                    <strong>{summary.statusLabel}</strong>
                    <p>{summary.body}</p>
                    <bdi className={styles.reference} dir="ltr">
                      {summary.summaryReference}
                    </bdi>
                    {visibility.review_context_item ? (
                      <button
                        className={styles.secondaryAction}
                        type="button"
                        disabled={
                          !isTraineeContextIntentEnabled(
                            state,
                            'review_context_item',
                            snapshot,
                            summary,
                          )
                        }
                        onClick={() => emitIntent('review_context_item', summary)}
                      >
                        {copy.intentLabels.review_context_item}
                      </button>
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
            data-region="progress-sequence"
            aria-labelledby="trainee-context-progress-heading"
          >
            <h2 id="trainee-context-progress-heading">{copy.progressHeading}</h2>
            <p>{content.progressBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="trainee-context-evidence-heading"
          >
            <h2 id="trainee-context-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
            <ul className={styles.referenceList}>
              {snapshot.evidenceReferences.map((reference) => (
                <li key={reference}>
                  <bdi className={styles.reference} dir="ltr">
                    {reference}
                  </bdi>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.region}
            data-region="context-consequence"
            aria-labelledby="trainee-context-consequence-heading"
          >
            <h2 id="trainee-context-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="trainee-context-actions-heading"
          >
            <h2 id="trainee-context-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter((kind) => kind !== 'review_context_item')
                .map((kind) => (
                  <button
                    className={
                      kind === 'refresh_context' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isTraineeContextIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="trainee-context-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="trainee-context-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="trainee-context-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="trainee-context-help-heading"
          >
            <h2 id="trainee-context-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
