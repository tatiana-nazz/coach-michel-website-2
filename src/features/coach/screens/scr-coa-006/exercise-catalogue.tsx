'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createExerciseCatalogueIntent,
  getExerciseCatalogueViewModel,
  isExerciseCatalogueIntentEnabled,
  type ExerciseCatalogueContent,
  type ExerciseCatalogueCopy,
  type ExerciseCatalogueIntent,
  type ExerciseCatalogueIntentKind,
  type ExerciseCatalogueItem,
  type ExerciseCatalogueSnapshot,
  type ExerciseCatalogueState,
  type ExerciseCatalogueVisibility,
} from './exercise-catalogue.model';
import styles from './exercise-catalogue.module.css';

export interface ExerciseCatalogueProps {
  readonly locale: SupportedLocale;
  readonly state: ExerciseCatalogueState;
  readonly snapshot: ExerciseCatalogueSnapshot;
  readonly copy: ExerciseCatalogueCopy;
  readonly content: ExerciseCatalogueContent;
  readonly visibility: ExerciseCatalogueVisibility;
  readonly onApprovalFilterReferenceChange: (filterReference: string | undefined) => void;
  readonly onSortReferenceChange: (sortReference: string | undefined) => void;
  readonly onIntent: (intent: ExerciseCatalogueIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

function selectedValue(value: string): string | undefined {
  return value.length === 0 ? undefined : value;
}

export function ExerciseCatalogue({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onApprovalFilterReferenceChange,
  onSortReferenceChange,
  onIntent,
}: ExerciseCatalogueProps) {
  const viewModel = getExerciseCatalogueViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: ExerciseCatalogueIntentKind, exercise?: ExerciseCatalogueItem) {
    if (!isExerciseCatalogueIntentEnabled(state, kind, snapshot, exercise)) {
      return;
    }

    const intent = createExerciseCatalogueIntent(kind, snapshot, exercise);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-006"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004 ROL-007"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="exercise-catalogue-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="exercise-catalogue-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <bdi className={styles.reference} dir="ltr">
            {snapshot.catalogueReference}
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
            aria-labelledby="exercise-catalogue-authority-heading"
          >
            <h2 id="exercise-catalogue-authority-heading">{copy.authorityHeading}</h2>
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
            data-region="collection-navigation-context"
            aria-labelledby="exercise-catalogue-controls-heading"
          >
            <h2 id="exercise-catalogue-controls-heading">{copy.controlsHeading}</h2>
            <p>{content.controlsBody}</p>
            <div className={styles.controlGrid}>
              <label htmlFor="exercise-catalogue-approval-filter">{copy.approvalFilterLabel}</label>
              <select
                id="exercise-catalogue-approval-filter"
                value={snapshot.selectedApprovalFilterReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="exercise-catalogue-feedback"
                aria-invalid={state === 'validation_error'}
                onChange={(event) =>
                  onApprovalFilterReferenceChange(selectedValue(event.currentTarget.value))
                }
              >
                <option value="">{copy.approvalFilterPlaceholder}</option>
                {snapshot.approvalFilterOptions.map((option) => (
                  <option key={option.optionReference} value={option.optionReference}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label htmlFor="exercise-catalogue-sort">{copy.sortLabel}</label>
              <select
                id="exercise-catalogue-sort"
                value={snapshot.selectedSortReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="exercise-catalogue-feedback"
                aria-invalid={state === 'validation_error'}
                onChange={(event) =>
                  onSortReferenceChange(selectedValue(event.currentTarget.value))
                }
              >
                <option value="">{copy.sortPlaceholder}</option>
                {snapshot.sortOptions.map((option) => (
                  <option key={option.optionReference} value={option.optionReference}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section
            className={styles.region}
            data-region="bounded-collection"
            aria-labelledby="exercise-catalogue-items-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="exercise-catalogue-items-heading">{copy.catalogueHeading}</h2>
            <p>{content.catalogueBody}</p>
            {viewModel.showCatalogue ? (
              <ol className={styles.catalogueList}>
                {snapshot.exercises.map((exercise) => (
                  <li className={styles.exercise} key={exercise.orderingReference}>
                    <h3>{exercise.displayLabel}</h3>
                    <strong>{exercise.approvalStatusLabel}</strong>
                    <ul className={styles.gateList}>
                      <li>{exercise.safetyStatusLabel}</li>
                      <li>{exercise.rightsStatusLabel}</li>
                      <li>{exercise.complexityStatusLabel}</li>
                      <li>{exercise.languageStatusLabel}</li>
                      <li>{exercise.accessibilityStatusLabel}</li>
                    </ul>
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
                      {exercise.draftVersionReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {exercise.draftVersionReference}
                        </bdi>
                      ) : null}
                      {exercise.publicationDecisionReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {exercise.publicationDecisionReference}
                        </bdi>
                      ) : null}
                      {exercise.evidenceReferences.map((reference) => (
                        <bdi className={styles.reference} dir="ltr" key={reference}>
                          {reference}
                        </bdi>
                      ))}
                    </div>
                    <div className={styles.itemActions}>
                      {visibility.review_exercise ? (
                        <button
                          className={styles.secondaryAction}
                          type="button"
                          disabled={
                            !isExerciseCatalogueIntentEnabled(
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
                      {visibility.prepare_content_draft_intent ? (
                        <button
                          className={styles.secondaryAction}
                          type="button"
                          disabled={
                            !isExerciseCatalogueIntentEnabled(
                              state,
                              'prepare_content_draft_intent',
                              snapshot,
                              exercise,
                            )
                          }
                          onClick={() => emitIntent('prepare_content_draft_intent', exercise)}
                        >
                          {copy.intentLabels.prepare_content_draft_intent}
                        </button>
                      ) : null}
                      {visibility.review_publication_context ? (
                        <button
                          className={styles.secondaryAction}
                          type="button"
                          disabled={
                            !isExerciseCatalogueIntentEnabled(
                              state,
                              'review_publication_context',
                              snapshot,
                              exercise,
                            )
                          }
                          onClick={() => emitIntent('review_publication_context', exercise)}
                        >
                          {copy.intentLabels.review_publication_context}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="collection-consequence"
            aria-labelledby="exercise-catalogue-consequence-heading"
          >
            <h2 id="exercise-catalogue-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="exercise-catalogue-actions-heading"
          >
            <h2 id="exercise-catalogue-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter(
                  (kind) =>
                    kind !== 'review_exercise' &&
                    kind !== 'prepare_content_draft_intent' &&
                    kind !== 'review_publication_context',
                )
                .map((kind) => (
                  <button
                    className={
                      kind === 'refresh_catalogue' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isExerciseCatalogueIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="exercise-catalogue-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="exercise-catalogue-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="exercise-catalogue-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="exercise-catalogue-help-heading">
            <h2 id="exercise-catalogue-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
