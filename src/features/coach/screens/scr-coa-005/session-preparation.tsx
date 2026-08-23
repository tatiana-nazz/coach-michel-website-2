'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createSessionPreparationIntent,
  getSessionPreparationViewModel,
  isSessionPreparationIntentEnabled,
  type SessionPreparationContent,
  type SessionPreparationCopy,
  type SessionPreparationExercise,
  type SessionPreparationIntent,
  type SessionPreparationIntentKind,
  type SessionPreparationSnapshot,
  type SessionPreparationState,
  type SessionPreparationVisibility,
} from './session-preparation.model';
import styles from './session-preparation.module.css';

export interface SessionPreparationProps {
  readonly locale: SupportedLocale;
  readonly state: SessionPreparationState;
  readonly snapshot: SessionPreparationSnapshot;
  readonly copy: SessionPreparationCopy;
  readonly content: SessionPreparationContent;
  readonly visibility: SessionPreparationVisibility;
  readonly onIntent: (intent: SessionPreparationIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function SessionPreparation({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onIntent,
}: SessionPreparationProps) {
  const viewModel = getSessionPreparationViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: SessionPreparationIntentKind, exercise?: SessionPreparationExercise) {
    if (!isSessionPreparationIntentEnabled(state, kind, snapshot, exercise)) {
      return;
    }

    const intent = createSessionPreparationIntent(kind, snapshot, exercise);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-005"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="session-preparation-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="session-preparation-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.traineeReference}
            </bdi>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.sessionReference}
            </bdi>
            {snapshot.programReference ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.programReference}
              </bdi>
            ) : null}
            {snapshot.sessionDraftReference ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.sessionDraftReference}
              </bdi>
            ) : null}
            {snapshot.draftVersionReference ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.draftVersionReference}
              </bdi>
            ) : null}
            {snapshot.boundedTimeContext ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.boundedTimeContext}
              </bdi>
            ) : null}
          </div>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="session-preparation-authority-heading"
          >
            <h2 id="session-preparation-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <div className={styles.referenceGroup}>
              <bdi className={styles.reference} dir="ltr">
                {snapshot.authorityStatusReference}
              </bdi>
              <bdi className={styles.reference} dir="ltr">
                {snapshot.lifecycleStatusReference}
              </bdi>
              {snapshot.preparationIntentReference ? (
                <bdi className={styles.reference} dir="ltr">
                  {snapshot.preparationIntentReference}
                </bdi>
              ) : null}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="session-preparation-exercises-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="session-preparation-exercises-heading">{copy.preparationHeading}</h2>
            <p>{content.preparationBody}</p>
            {viewModel.showContext && snapshot.exercises.length > 0 ? (
              <ol className={styles.cardList}>
                {snapshot.exercises.map((exercise) => (
                  <li className={styles.card} key={exercise.orderingReference}>
                    <h3>{exercise.displayLabel}</h3>
                    <strong>{exercise.approvalStatusLabel}</strong>
                    <p>{exercise.summary}</p>
                    <div className={styles.referenceGroup}>
                      <bdi className={styles.reference} dir="ltr">
                        {exercise.exerciseReference}
                      </bdi>
                      <bdi className={styles.reference} dir="ltr">
                        {exercise.orderingReference}
                      </bdi>
                      {exercise.contentDraftReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {exercise.contentDraftReference}
                        </bdi>
                      ) : null}
                      {exercise.guidanceReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {exercise.guidanceReference}
                        </bdi>
                      ) : null}
                    </div>
                    {visibility.review_exercise ? (
                      <button
                        className={styles.secondaryAction}
                        type="button"
                        disabled={
                          !isSessionPreparationIntentEnabled(
                            state,
                            'review_exercise',
                            snapshot,
                            exercise,
                          )
                        }
                        onClick={() => emitIntent('review_exercise', exercise)}
                      >
                        {copy.intentLabels.review_exercise}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="progress-sequence"
            aria-labelledby="session-preparation-sequence-heading"
          >
            <h2 id="session-preparation-sequence-heading">{copy.sequenceHeading}</h2>
            <p>{content.sequenceBody}</p>
            <ol className={styles.sequenceList}>
              {snapshot.sequence.map((step) => (
                <li className={styles.sequenceItem} key={step.orderingReference}>
                  <h3>{step.heading}</h3>
                  <strong>{step.statusLabel}</strong>
                  <p>{step.body}</p>
                  <div className={styles.referenceGroup}>
                    <bdi className={styles.reference} dir="ltr">
                      {step.sequenceReference}
                    </bdi>
                    <bdi className={styles.reference} dir="ltr">
                      {step.orderingReference}
                    </bdi>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className={styles.region}
            data-region="supporting-detail"
            aria-labelledby="session-preparation-guidance-heading"
          >
            <h2 id="session-preparation-guidance-heading">{copy.guidanceHeading}</h2>
            <p>{content.guidanceBody}</p>
            <ul className={styles.guidanceList}>
              {snapshot.guidance.map((guidance) => (
                <li key={guidance.guidanceReference}>
                  <h3>{guidance.heading}</h3>
                  <p>{guidance.body}</p>
                  <bdi className={styles.reference} dir="ltr">
                    {guidance.guidanceReference}
                  </bdi>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="session-preparation-evidence-heading"
          >
            <h2 id="session-preparation-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
            <ul className={styles.referenceList}>
              {[...snapshot.evidenceReferences, ...snapshot.auditReferences].map((reference) => (
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
            aria-labelledby="session-preparation-consequence-heading"
          >
            <h2 id="session-preparation-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="session-preparation-actions-heading"
          >
            <h2 id="session-preparation-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter((kind) => kind !== 'review_exercise')
                .map((kind) => (
                  <button
                    className={
                      kind === 'prepare_session_draft_intent'
                        ? styles.primaryAction
                        : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isSessionPreparationIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="session-preparation-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="session-preparation-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="session-preparation-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="session-preparation-help-heading"
          >
            <h2 id="session-preparation-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
