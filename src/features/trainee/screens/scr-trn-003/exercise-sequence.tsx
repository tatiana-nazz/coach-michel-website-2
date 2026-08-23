'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createExerciseSequenceIntent,
  getExerciseSequenceViewModel,
  isExerciseSequenceIntentEnabled,
  type ExerciseSequenceContent,
  type ExerciseSequenceCopy,
  type ExerciseSequenceIntent,
  type ExerciseSequenceIntentKind,
  type ExerciseSequenceItem,
  type ExerciseSequenceRecoveryContext,
  type ExerciseSequenceSnapshot,
  type ExerciseSequenceState,
  type ExerciseSequenceVisibility,
} from './exercise-sequence.model';
import styles from './exercise-sequence.module.css';

export interface ExerciseSequenceProps {
  readonly locale: SupportedLocale;
  readonly state: ExerciseSequenceState;
  readonly copy: ExerciseSequenceCopy;
  readonly content: ExerciseSequenceContent;
  readonly snapshot: ExerciseSequenceSnapshot;
  readonly visibility: ExerciseSequenceVisibility;
  readonly recoveryContext?: ExerciseSequenceRecoveryContext;
  readonly onIntent: (intent: ExerciseSequenceIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function ExerciseSequence({
  locale,
  state,
  copy,
  content,
  snapshot,
  visibility,
  recoveryContext,
  onIntent,
}: ExerciseSequenceProps) {
  const viewModel = getExerciseSequenceViewModel(
    locale,
    state,
    snapshot,
    visibility,
    recoveryContext,
  );
  const stateMessage = copy.feedback[state];

  function emitIntent(kind: ExerciseSequenceIntentKind, item?: ExerciseSequenceItem) {
    if (!isExerciseSequenceIntentEnabled(state, kind, item, recoveryContext)) return;
    const intent = createExerciseSequenceIntent(kind, snapshot, item, recoveryContext);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-003"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-003"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="exercise-sequence-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="exercise-sequence-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>
        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="exercise-sequence-authority-heading"
          >
            <h2 id="exercise-sequence-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.sessionScheduleReference}
            </bdi>
          </section>

          <section
            className={styles.progressRegion}
            data-region="progress-sequence"
            aria-labelledby="exercise-sequence-progress-heading"
          >
            <h2 id="exercise-sequence-progress-heading">{copy.progressHeading}</h2>
            <label className={styles.progressLabel}>
              {snapshot.progressLabel}
              <progress value={snapshot.progressValue} max={snapshot.progressMaximum}>
                {snapshot.progressLabel}
              </progress>
            </label>
          </section>

          <section
            className={styles.sequenceRegion}
            data-region="primary-task"
            aria-labelledby="exercise-sequence-list-heading"
          >
            <h2 id="exercise-sequence-list-heading">{copy.sequenceHeading}</h2>
            {viewModel.showSequence ? (
              <ol className={styles.sequenceList}>
                {snapshot.items.map((item) => {
                  const current = item.exerciseReference === snapshot.currentExerciseReference;
                  return (
                    <li
                      className={styles.sequenceItem}
                      key={item.exerciseReference}
                      aria-current={current ? 'step' : undefined}
                    >
                      <article>
                        <h3>{item.heading}</h3>
                        <p className={styles.statusLabel}>{item.statusLabel}</p>
                        <p>{item.summary}</p>
                        <bdi className={styles.reference} dir="ltr">
                          {item.exerciseReference}
                        </bdi>
                      </article>
                      {visibility.request_exercise ? (
                        <button
                          type="button"
                          disabled={
                            !isExerciseSequenceIntentEnabled(
                              state,
                              'request_exercise',
                              item,
                              recoveryContext,
                            )
                          }
                          onClick={() => emitIntent('request_exercise', item)}
                        >
                          {copy.intentLabels.request_exercise}
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="exercise-sequence-consequence-heading"
          >
            <h2 id="exercise-sequence-consequence-heading">{copy.consequenceHeading}</h2>
            <p>
              {viewModel.durableFinal
                ? content.durableFinalConsequenceBody
                : content.localConsequenceBody}
            </p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="exercise-sequence-actions-heading"
          >
            <h2 id="exercise-sequence-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleRecoveryIntents.map((kind) => (
                <button
                  className={styles.secondaryAction}
                  key={kind}
                  type="button"
                  disabled={
                    !isExerciseSequenceIntentEnabled(state, kind, undefined, recoveryContext)
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
            aria-labelledby="exercise-sequence-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="exercise-sequence-feedback-heading">{copy.feedbackHeading}</h2>
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
            aria-labelledby="exercise-sequence-help-heading"
          >
            <h2 id="exercise-sequence-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
