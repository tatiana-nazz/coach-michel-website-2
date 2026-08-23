'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createProgramsSessionsCollectionIntent,
  getProgramsSessionsCollectionViewModel,
  isProgramsSessionsCollectionIntentEnabled,
  type ProgramsSessionsCollectionContent,
  type ProgramsSessionsCollectionCopy,
  type ProgramsSessionsCollectionIntent,
  type ProgramsSessionsCollectionIntentKind,
  type ProgramsSessionsCollectionItem,
  type ProgramsSessionsCollectionSnapshot,
  type ProgramsSessionsCollectionState,
  type ProgramsSessionsCollectionVisibility,
} from './programs-sessions-collection.model';
import styles from './programs-sessions-collection.module.css';

export interface ProgramsSessionsCollectionProps {
  readonly locale: SupportedLocale;
  readonly state: ProgramsSessionsCollectionState;
  readonly snapshot: ProgramsSessionsCollectionSnapshot;
  readonly copy: ProgramsSessionsCollectionCopy;
  readonly content: ProgramsSessionsCollectionContent;
  readonly visibility: ProgramsSessionsCollectionVisibility;
  readonly onFilterReferenceChange: (filterReference: string | undefined) => void;
  readonly onSortReferenceChange: (sortReference: string | undefined) => void;
  readonly onIntent: (intent: ProgramsSessionsCollectionIntent) => void;
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

function itemReference(item: ProgramsSessionsCollectionItem): string {
  return item.kind === 'program' ? item.programReference : item.sessionReference;
}

export function ProgramsSessionsCollection({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onFilterReferenceChange,
  onSortReferenceChange,
  onIntent,
}: ProgramsSessionsCollectionProps) {
  const viewModel = getProgramsSessionsCollectionViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(
    kind: ProgramsSessionsCollectionIntentKind,
    item?: ProgramsSessionsCollectionItem,
  ) {
    if (!isProgramsSessionsCollectionIntentEnabled(state, kind, snapshot, item)) {
      return;
    }

    const intent = createProgramsSessionsCollectionIntent(kind, snapshot, item);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  function renderItem(item: ProgramsSessionsCollectionItem) {
    return (
      <li className={styles.planningItem} key={item.orderingReference}>
        <h3>{item.displayLabel}</h3>
        <strong>{item.statusLabel}</strong>
        <p>{item.scheduleLabel}</p>
        <p>{item.summary}</p>
        <div className={styles.referenceGroup}>
          <bdi className={styles.reference} dir="ltr">
            {itemReference(item)}
          </bdi>
          <bdi className={styles.reference} dir="ltr">
            {item.traineeReference}
          </bdi>
          <bdi className={styles.reference} dir="ltr">
            {item.orderingReference}
          </bdi>
          {item.draftReference ? (
            <bdi className={styles.reference} dir="ltr">
              {item.draftReference}
            </bdi>
          ) : null}
          {item.draftVersionReference ? (
            <bdi className={styles.reference} dir="ltr">
              {item.draftVersionReference}
            </bdi>
          ) : null}
        </div>
        <div className={styles.itemActions}>
          {visibility.review_item ? (
            <button
              className={styles.secondaryAction}
              type="button"
              disabled={
                !isProgramsSessionsCollectionIntentEnabled(state, 'review_item', snapshot, item)
              }
              onClick={() => emitIntent('review_item', item)}
            >
              {copy.intentLabels.review_item}
            </button>
          ) : null}
          {visibility.prepare_draft_intent ? (
            <button
              className={styles.secondaryAction}
              type="button"
              disabled={
                !isProgramsSessionsCollectionIntentEnabled(
                  state,
                  'prepare_draft_intent',
                  snapshot,
                  item,
                )
              }
              onClick={() => emitIntent('prepare_draft_intent', item)}
            >
              {copy.intentLabels.prepare_draft_intent}
            </button>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-004"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="programs-sessions-collection-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="programs-sessions-collection-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <bdi className={styles.reference} dir="ltr">
            {snapshot.collectionReference}
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
            aria-labelledby="programs-sessions-authority-heading"
          >
            <h2 id="programs-sessions-authority-heading">{copy.authorityHeading}</h2>
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
            aria-labelledby="programs-sessions-controls-heading"
          >
            <h2 id="programs-sessions-controls-heading">{copy.controlsHeading}</h2>
            <p>{content.controlsBody}</p>
            <div className={styles.controlGrid}>
              <label htmlFor="programs-sessions-filter">{copy.filterLabel}</label>
              <select
                id="programs-sessions-filter"
                value={snapshot.selectedFilterReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="programs-sessions-feedback"
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

              <label htmlFor="programs-sessions-sort">{copy.sortLabel}</label>
              <select
                id="programs-sessions-sort"
                value={snapshot.selectedSortReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="programs-sessions-feedback"
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
            data-region="programs-collection"
            aria-labelledby="programs-collection-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="programs-collection-heading">{copy.programsHeading}</h2>
            <p>{content.programsBody}</p>
            {viewModel.showPrograms ? (
              <ol className={styles.collectionList}>{snapshot.programs.map(renderItem)}</ol>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="sessions-collection"
            aria-labelledby="sessions-collection-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="sessions-collection-heading">{copy.sessionsHeading}</h2>
            <p>{content.sessionsBody}</p>
            {viewModel.showSessions ? (
              <ol className={styles.collectionList}>{snapshot.sessions.map(renderItem)}</ol>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="collection-consequence"
            aria-labelledby="programs-sessions-consequence-heading"
          >
            <h2 id="programs-sessions-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="programs-sessions-actions-heading"
          >
            <h2 id="programs-sessions-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter((kind) => kind !== 'review_item' && kind !== 'prepare_draft_intent')
                .map((kind) => (
                  <button
                    className={
                      kind === 'refresh_collection' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isProgramsSessionsCollectionIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="programs-sessions-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="programs-sessions-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="programs-sessions-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="programs-sessions-help-heading">
            <h2 id="programs-sessions-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
