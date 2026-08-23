'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createTodayTrainingStatusIntent,
  getTodayTrainingStatusViewModel,
  isTodayTrainingStatusIntentEnabled,
  type TodayTrainingProjectionContext,
  type TodayTrainingStatusContent,
  type TodayTrainingStatusCopy,
  type TodayTrainingStatusIntent,
  type TodayTrainingStatusIntentKind,
  type TodayTrainingStatusSnapshot,
  type TodayTrainingStatusState,
  type TodayTrainingStatusVisibility,
} from './today-training-status.model';
import styles from './today-training-status.module.css';

export interface TodayTrainingStatusProps {
  readonly locale: SupportedLocale;
  readonly state: TodayTrainingStatusState;
  readonly copy: TodayTrainingStatusCopy;
  readonly content: TodayTrainingStatusContent;
  readonly snapshot: TodayTrainingStatusSnapshot;
  readonly visibility: TodayTrainingStatusVisibility;
  readonly projectionContext?: TodayTrainingProjectionContext;
  readonly onIntent: (intent: TodayTrainingStatusIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function TodayTrainingStatus({
  locale,
  state,
  copy,
  content,
  snapshot,
  visibility,
  projectionContext,
  onIntent,
}: TodayTrainingStatusProps) {
  const viewModel = getTodayTrainingStatusViewModel(
    locale,
    state,
    snapshot,
    visibility,
    projectionContext,
  );
  const stateMessage = copy.feedback[state];

  function emitIntent(kind: TodayTrainingStatusIntentKind) {
    if (!isTodayTrainingStatusIntentEnabled(state, kind, snapshot, projectionContext)) {
      return;
    }

    const intent = createTodayTrainingStatusIntent(kind, snapshot, projectionContext);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-001"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-003 ROL-012"
      data-selected-direction-treatment="SELECTED_DIRECTION_ANCHOR_REFERENCE_ONLY"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="today-training-status-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="today-training-status-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="today-training-authority-heading"
          >
            <h2 id="today-training-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.coachingDayContext}
            </bdi>
          </section>

          <section
            className={styles.statusRegion}
            data-region="status-summary"
            aria-labelledby="today-training-summary-heading"
          >
            <h2 id="today-training-summary-heading">{copy.statusHeading}</h2>
            {viewModel.showStatus ? (
              <div className={styles.statusCard}>
                <h3>{snapshot.statusHeading}</h3>
                <p>{snapshot.statusBody}</p>
                <bdi className={styles.reference} dir="ltr">
                  {snapshot.statusReference}
                </bdi>
              </div>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="today-training-next-action-heading"
          >
            <h2 id="today-training-next-action-heading">{copy.nextActionHeading}</h2>
            {viewModel.showStatus ? (
              <>
                <h3>{snapshot.nextActionHeading}</h3>
                <p>{snapshot.nextActionBody}</p>
                {snapshot.nextActionReference ? (
                  <bdi className={styles.reference} dir="ltr">
                    {snapshot.nextActionReference}
                  </bdi>
                ) : null}
              </>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="today-training-consequence-heading"
          >
            <h2 id="today-training-consequence-heading">{copy.consequenceHeading}</h2>
            <p>
              {viewModel.durableFinal
                ? content.durableFinalConsequenceBody
                : content.localConsequenceBody}
            </p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="today-training-actions-heading"
          >
            <h2 id="today-training-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'request_next_action' ? styles.primaryAction : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={
                    !isTodayTrainingStatusIntentEnabled(state, kind, snapshot, projectionContext)
                  }
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
            aria-labelledby="today-training-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="today-training-feedback-heading">{copy.feedbackHeading}</h2>
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
            aria-labelledby="today-training-help-heading"
          >
            <h2 id="today-training-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
