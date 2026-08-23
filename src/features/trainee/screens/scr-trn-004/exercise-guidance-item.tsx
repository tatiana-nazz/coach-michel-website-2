'use client';

import type { ReactNode } from 'react';
import type { SupportedLocale } from '@/i18n/config';

import {
  createExerciseGuidanceItemIntent,
  getExerciseGuidanceItemViewModel,
  isExerciseGuidanceItemIntentEnabled,
  type ExerciseGuidanceExternalContext,
  type ExerciseGuidanceItemContent,
  type ExerciseGuidanceItemCopy,
  type ExerciseGuidanceItemIntent,
  type ExerciseGuidanceItemIntentKind,
  type ExerciseGuidanceItemState,
  type ExerciseGuidanceItemVisibility,
  type ExerciseGuidanceMediaItem,
  type ExerciseGuidanceSnapshot,
} from './exercise-guidance-item.model';
import styles from './exercise-guidance-item.module.css';

export interface ExerciseGuidanceItemProps {
  readonly locale: SupportedLocale;
  readonly state: ExerciseGuidanceItemState;
  readonly copy: ExerciseGuidanceItemCopy;
  readonly content: ExerciseGuidanceItemContent;
  readonly snapshot: ExerciseGuidanceSnapshot;
  readonly visibility: ExerciseGuidanceItemVisibility;
  readonly externalContext?: ExerciseGuidanceExternalContext;
  readonly renderRightsClearedMedia?: (media: ExerciseGuidanceMediaItem) => ReactNode;
  readonly onIntent: (intent: ExerciseGuidanceItemIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function ExerciseGuidanceItem({
  locale,
  state,
  copy,
  content,
  snapshot,
  visibility,
  externalContext,
  renderRightsClearedMedia,
  onIntent,
}: ExerciseGuidanceItemProps) {
  const viewModel = getExerciseGuidanceItemViewModel(
    locale,
    state,
    snapshot,
    visibility,
    externalContext,
  );
  const stateMessage = copy.feedback[state];

  function emitIntent(kind: ExerciseGuidanceItemIntentKind) {
    if (!isExerciseGuidanceItemIntentEnabled(state, kind, snapshot, externalContext)) return;
    const intent = createExerciseGuidanceItemIntent(kind, snapshot, externalContext);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-004"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-002 ROL-003 ROL-008 ROL-009 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="exercise-guidance-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="exercise-guidance-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>
        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="exercise-guidance-authority-heading"
          >
            <h2 id="exercise-guidance-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.sessionScheduleReference}
            </bdi>
          </section>

          <section
            className={styles.progressRegion}
            data-region="progress-sequence"
            aria-labelledby="exercise-guidance-progress-heading"
          >
            <h2 id="exercise-guidance-progress-heading">{copy.progressHeading}</h2>
            <p>{snapshot.progressLabel}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.exerciseReference}
            </bdi>
          </section>

          <section
            className={styles.guidanceRegion}
            data-region="primary-task"
            aria-labelledby="exercise-guidance-instructions-heading"
          >
            <h2 id="exercise-guidance-instructions-heading">{copy.instructionsHeading}</h2>
            {viewModel.showGuidance ? (
              <>
                <h3>{snapshot.exerciseHeading}</h3>
                <p>{snapshot.exerciseSummary}</p>
                <ol className={styles.instructions}>
                  {snapshot.instructions.map((item) => (
                    <li key={item.instructionReference}>
                      <article>
                        <h4>{item.heading}</h4>
                        <p>{item.body}</p>
                        <bdi className={styles.reference} dir="ltr">
                          {item.instructionReference}
                        </bdi>
                      </article>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.mediaRegion}
            data-region="rights-cleared-media"
            aria-labelledby="exercise-guidance-media-heading"
          >
            <h2 id="exercise-guidance-media-heading">{copy.mediaHeading}</h2>
            {viewModel.showGuidance && snapshot.media.length > 0 ? (
              <div className={styles.mediaList}>
                {snapshot.media.map((media, index) => {
                  const captionId = `exercise-guidance-media-${index}-caption`;
                  return (
                    <figure key={media.mediaReference} aria-labelledby={captionId}>
                      <div
                        className={styles.mediaPresentation}
                        role="group"
                        aria-label={media.accessibleLabel}
                      >
                        {renderRightsClearedMedia?.(media)}
                      </div>
                      <figcaption id={captionId}>
                        {media.caption}
                        <bdi className={styles.reference} dir="ltr">
                          {media.mediaReference}
                        </bdi>
                        <bdi className={styles.reference} dir="ltr">
                          {media.rightsEvidenceReference}
                        </bdi>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="exercise-guidance-consequence-heading"
          >
            <h2 id="exercise-guidance-consequence-heading">{copy.consequenceHeading}</h2>
            <p>
              {viewModel.durableFinal
                ? content.durableFinalConsequenceBody
                : content.localConsequenceBody}
            </p>
          </section>

          {visibility.support_privacy || visibility.external_handoff ? (
            <section
              className={styles.region}
              data-region="external-handoff"
              data-visibility-source="caller-role-capability"
              aria-labelledby="exercise-guidance-external-heading"
            >
              <h2 id="exercise-guidance-external-heading">{copy.externalHeading}</h2>
              <p>{content.externalBody}</p>
              {externalContext ? (
                <bdi className={styles.reference} dir="ltr">
                  {externalContext.correlationReference}
                </bdi>
              ) : null}
            </section>
          ) : null}

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="exercise-guidance-actions-heading"
          >
            <h2 id="exercise-guidance-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'request_guidance_action'
                      ? styles.primaryAction
                      : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={
                    !isExerciseGuidanceItemIntentEnabled(state, kind, snapshot, externalContext)
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
            aria-labelledby="exercise-guidance-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="exercise-guidance-feedback-heading">{copy.feedbackHeading}</h2>
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
            aria-labelledby="exercise-guidance-help-heading"
          >
            <h2 id="exercise-guidance-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
