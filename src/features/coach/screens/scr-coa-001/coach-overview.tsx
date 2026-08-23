'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createCoachOverviewIntent,
  getCoachOverviewViewModel,
  isCoachOverviewIntentEnabled,
  type CoachOverviewContent,
  type CoachOverviewCopy,
  type CoachOverviewIntent,
  type CoachOverviewIntentKind,
  type CoachOverviewSnapshot,
  type CoachOverviewState,
  type CoachOverviewSummary,
  type CoachOverviewVisibility,
} from './coach-overview.model';
import styles from './coach-overview.module.css';

export interface CoachOverviewProps {
  readonly locale: SupportedLocale;
  readonly state: CoachOverviewState;
  readonly snapshot: CoachOverviewSnapshot;
  readonly copy: CoachOverviewCopy;
  readonly content: CoachOverviewContent;
  readonly visibility: CoachOverviewVisibility;
  readonly onFilterReferenceChange: (filterReference: string, selected: boolean) => void;
  readonly onIntent: (intent: CoachOverviewIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function CoachOverview({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onFilterReferenceChange,
  onIntent,
}: CoachOverviewProps) {
  const viewModel = getCoachOverviewViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: CoachOverviewIntentKind, summary?: CoachOverviewSummary) {
    if (!isCoachOverviewIntentEnabled(state, kind, snapshot, summary)) {
      return;
    }

    const intent = createCoachOverviewIntent(kind, snapshot, summary);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-001"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="coach-overview-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="coach-overview-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <bdi className={styles.reference} dir="ltr">
            {snapshot.overviewStatusReference}
          </bdi>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="coach-overview-authority-heading"
          >
            <h2 id="coach-overview-authority-heading">{copy.authorityHeading}</h2>
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
            aria-labelledby="coach-overview-filters-heading"
          >
            <h2 id="coach-overview-filters-heading">{copy.filtersHeading}</h2>
            <p>{content.filtersBody}</p>
            {snapshot.timeWindowContext ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.timeWindowContext}
              </bdi>
            ) : null}
            <fieldset
              className={styles.filters}
              aria-describedby="coach-overview-feedback"
              aria-invalid={state === 'validation_error'}
            >
              <legend>{copy.filtersLegend}</legend>
              {snapshot.filterOptions.map((option) => (
                <label className={styles.filterOption} key={option.filterReference}>
                  <input
                    type="checkbox"
                    checked={snapshot.selectedFilterReferences.includes(option.filterReference)}
                    disabled={!viewModel.filterSelectionEnabled}
                    onChange={(event) =>
                      onFilterReferenceChange(option.filterReference, event.currentTarget.checked)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="coach-overview-summaries-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="coach-overview-summaries-heading">{copy.summariesHeading}</h2>
            {viewModel.showSummaries ? (
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
                    {visibility.review_summary ? (
                      <button
                        className={styles.secondaryAction}
                        type="button"
                        disabled={
                          !isCoachOverviewIntentEnabled(state, 'review_summary', snapshot, summary)
                        }
                        onClick={() => emitIntent('review_summary', summary)}
                      >
                        {summary.nextActionLabel}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          {snapshot.projectionContext ? (
            <section
              className={styles.region}
              data-region="supporting-detail"
              aria-labelledby="coach-overview-projection-heading"
            >
              <h2 id="coach-overview-projection-heading">{copy.projectionHeading}</h2>
              <p>{content.projectionBody}</p>
              <bdi className={styles.reference} dir="ltr">
                {snapshot.projectionContext.affectedProjectionReference}
              </bdi>
              <ul className={styles.referenceList}>
                {snapshot.projectionContext.sourceEvidenceReferences.map((reference) => (
                  <li key={reference}>
                    <bdi className={styles.reference} dir="ltr">
                      {reference}
                    </bdi>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section
            className={styles.region}
            data-region="status-consequence"
            aria-labelledby="coach-overview-consequence-heading"
          >
            <h2 id="coach-overview-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="coach-overview-actions-heading"
          >
            <h2 id="coach-overview-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter((kind) => kind !== 'review_summary')
                .map((kind) => (
                  <button
                    className={
                      kind === 'refresh_overview' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isCoachOverviewIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="coach-overview-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="coach-overview-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="coach-overview-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="coach-overview-help-heading"
          >
            <h2 id="coach-overview-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
