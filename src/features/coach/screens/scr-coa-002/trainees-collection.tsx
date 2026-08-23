'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createTraineesCollectionIntent,
  getTraineesCollectionViewModel,
  isTraineesCollectionIntentEnabled,
  type TraineesCollectionContent,
  type TraineesCollectionCopy,
  type TraineesCollectionIntent,
  type TraineesCollectionIntentKind,
  type TraineesCollectionItem,
  type TraineesCollectionSnapshot,
  type TraineesCollectionState,
  type TraineesCollectionVisibility,
} from './trainees-collection.model';
import styles from './trainees-collection.module.css';

export interface TraineesCollectionProps {
  readonly locale: SupportedLocale;
  readonly state: TraineesCollectionState;
  readonly snapshot: TraineesCollectionSnapshot;
  readonly copy: TraineesCollectionCopy;
  readonly content: TraineesCollectionContent;
  readonly visibility: TraineesCollectionVisibility;
  readonly onSearchReferenceChange: (searchReference: string | undefined) => void;
  readonly onFilterReferenceChange: (filterReference: string | undefined) => void;
  readonly onSortReferenceChange: (sortReference: string | undefined) => void;
  readonly onIntent: (intent: TraineesCollectionIntent) => void;
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

export function TraineesCollection({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onSearchReferenceChange,
  onFilterReferenceChange,
  onSortReferenceChange,
  onIntent,
}: TraineesCollectionProps) {
  const viewModel = getTraineesCollectionViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: TraineesCollectionIntentKind, trainee?: TraineesCollectionItem) {
    if (!isTraineesCollectionIntentEnabled(state, kind, snapshot, trainee)) {
      return;
    }

    const intent = createTraineesCollectionIntent(kind, snapshot, trainee);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-002"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="trainees-collection-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="trainees-collection-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <bdi className={styles.reference} dir="ltr">
            {snapshot.collectionReference}
          </bdi>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="trainees-collection-authority-heading"
          >
            <h2 id="trainees-collection-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <div className={styles.referenceGroup}>
              <bdi className={styles.reference} dir="ltr">
                {snapshot.authorityStatusReference}
              </bdi>
              <bdi className={styles.reference} dir="ltr">
                {snapshot.lifecycleStatusReference}
              </bdi>
              {snapshot.coachGrantReference ? (
                <bdi className={styles.reference} dir="ltr">
                  {snapshot.coachGrantReference}
                </bdi>
              ) : null}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="collection-navigation-context"
            aria-labelledby="trainees-collection-controls-heading"
          >
            <h2 id="trainees-collection-controls-heading">{copy.controlsHeading}</h2>
            <p>{content.controlsBody}</p>
            <div className={styles.controlGrid}>
              <label htmlFor="trainees-collection-search">{copy.searchLabel}</label>
              <select
                id="trainees-collection-search"
                value={snapshot.selectedSearchReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="trainees-collection-feedback"
                aria-invalid={state === 'validation_error'}
                onChange={(event) =>
                  onSearchReferenceChange(selectedValue(event.currentTarget.value))
                }
              >
                <option value="">{copy.searchPlaceholder}</option>
                {snapshot.searchOptions.map((option) => (
                  <option key={option.optionReference} value={option.optionReference}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label htmlFor="trainees-collection-filter">{copy.filterLabel}</label>
              <select
                id="trainees-collection-filter"
                value={snapshot.selectedFilterReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="trainees-collection-feedback"
                aria-invalid={state === 'validation_error'}
                onChange={(event) =>
                  onFilterReferenceChange(selectedValue(event.currentTarget.value))
                }
              >
                <option value="">{copy.filterPlaceholder}</option>
                {snapshot.filterOptions.map((option) => (
                  <option key={option.optionReference} value={option.optionReference}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label htmlFor="trainees-collection-sort">{copy.sortLabel}</label>
              <select
                id="trainees-collection-sort"
                value={snapshot.selectedSortReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="trainees-collection-feedback"
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
            aria-labelledby="trainees-collection-items-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="trainees-collection-items-heading">{copy.collectionHeading}</h2>
            {viewModel.showCollection ? (
              <ol className={styles.collectionList}>
                {snapshot.trainees.map((trainee) => (
                  <li className={styles.trainee} key={trainee.orderingReference}>
                    <h3>{trainee.displayLabel}</h3>
                    <strong>{trainee.statusLabel}</strong>
                    <p>{trainee.summary}</p>
                    <div className={styles.referenceGroup}>
                      <bdi className={styles.reference} dir="ltr">
                        {trainee.traineeReference}
                      </bdi>
                      <bdi className={styles.reference} dir="ltr">
                        {trainee.orderingReference}
                      </bdi>
                    </div>
                    {visibility.select_trainee ? (
                      <button
                        className={styles.secondaryAction}
                        type="button"
                        disabled={
                          !isTraineesCollectionIntentEnabled(
                            state,
                            'select_trainee',
                            snapshot,
                            trainee,
                          )
                        }
                        onClick={() => emitIntent('select_trainee', trainee)}
                      >
                        {copy.intentLabels.select_trainee}
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
            data-region="collection-consequence"
            aria-labelledby="trainees-collection-consequence-heading"
          >
            <h2 id="trainees-collection-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="trainees-collection-actions-heading"
          >
            <h2 id="trainees-collection-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter((kind) => kind !== 'select_trainee')
                .map((kind) => (
                  <button
                    className={
                      kind === 'refresh_collection' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isTraineesCollectionIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="trainees-collection-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="trainees-collection-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="trainees-collection-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="trainees-collection-help-heading">
            <h2 id="trainees-collection-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
