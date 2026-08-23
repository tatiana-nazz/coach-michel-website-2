'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createCompletionAdherenceMonitoringIntent,
  getCompletionAdherenceMonitoringViewModel,
  isCompletionAdherenceMonitoringIntentEnabled,
  type CompletionAdherenceMonitoringContent,
  type CompletionAdherenceMonitoringCopy,
  type CompletionAdherenceMonitoringIntent,
  type CompletionAdherenceMonitoringIntentKind,
  type CompletionAdherenceMonitoringItem,
  type CompletionAdherenceMonitoringSnapshot,
  type CompletionAdherenceMonitoringState,
  type CompletionAdherenceMonitoringVisibility,
} from './completion-adherence-monitoring.model';
import styles from './completion-adherence-monitoring.module.css';

export interface CompletionAdherenceMonitoringProps {
  readonly locale: SupportedLocale;
  readonly state: CompletionAdherenceMonitoringState;
  readonly snapshot: CompletionAdherenceMonitoringSnapshot;
  readonly copy: CompletionAdherenceMonitoringCopy;
  readonly content: CompletionAdherenceMonitoringContent;
  readonly visibility: CompletionAdherenceMonitoringVisibility;
  readonly onStatusFilterReferenceChange: (reference: string | undefined) => void;
  readonly onSortReferenceChange: (reference: string | undefined) => void;
  readonly onIntent: (intent: CompletionAdherenceMonitoringIntent) => void;
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

export function CompletionAdherenceMonitoring({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onStatusFilterReferenceChange,
  onSortReferenceChange,
  onIntent,
}: CompletionAdherenceMonitoringProps) {
  const viewModel = getCompletionAdherenceMonitoringViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(
    kind: CompletionAdherenceMonitoringIntentKind,
    item?: CompletionAdherenceMonitoringItem,
  ) {
    if (!isCompletionAdherenceMonitoringIntentEnabled(state, kind, snapshot, item)) return;
    const intent = createCompletionAdherenceMonitoringIntent(kind, snapshot, item);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-008"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="completion-monitoring-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="completion-monitoring-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.monitoringReference}
            </bdi>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.authoritativeTimeContext}
            </bdi>
            {snapshot.projectionReference ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.projectionReference}
              </bdi>
            ) : null}
          </div>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="completion-monitoring-authority-heading"
          >
            <h2 id="completion-monitoring-authority-heading">{copy.authorityHeading}</h2>
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
            aria-labelledby="completion-monitoring-controls-heading"
          >
            <h2 id="completion-monitoring-controls-heading">{copy.controlsHeading}</h2>
            <p>{content.controlsBody}</p>
            <div className={styles.controlGrid}>
              <label htmlFor="completion-monitoring-status-filter">{copy.statusFilterLabel}</label>
              <select
                id="completion-monitoring-status-filter"
                value={snapshot.selectedStatusFilterReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="completion-monitoring-feedback"
                aria-invalid={state === 'validation_error'}
                onChange={(event) =>
                  onStatusFilterReferenceChange(selectedValue(event.currentTarget.value))
                }
              >
                <option value="">{copy.statusFilterPlaceholder}</option>
                {snapshot.statusFilterOptions.map((option) => (
                  <option key={option.optionReference} value={option.optionReference}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="completion-monitoring-sort">{copy.sortLabel}</label>
              <select
                id="completion-monitoring-sort"
                value={snapshot.selectedSortReference ?? ''}
                disabled={!viewModel.controlsEnabled}
                aria-describedby="completion-monitoring-feedback"
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
            data-region="monitoring-review"
            aria-labelledby="completion-monitoring-items-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="completion-monitoring-items-heading">{copy.monitoringHeading}</h2>
            <p>{content.monitoringBody}</p>
            {viewModel.showMonitoring ? (
              <ol className={styles.itemList}>
                {snapshot.items.map((item) => (
                  <li className={styles.item} key={item.orderingReference}>
                    <h3>{item.displayLabel}</h3>
                    <ul className={styles.statusList}>
                      <li>{item.scheduleStatusLabel}</li>
                      <li>{item.completionStatusLabel}</li>
                      <li>{item.adherenceStatusLabel}</li>
                      <li>{item.authoritativeTimeLabel}</li>
                      <li>{item.projectionStatusLabel}</li>
                    </ul>
                    <p>{item.summary}</p>
                    <div className={styles.referenceGroup}>
                      <bdi className={styles.reference} dir="ltr">
                        {item.traineeReference}
                      </bdi>
                      <bdi className={styles.reference} dir="ltr">
                        {item.scheduleReference}
                      </bdi>
                      {item.completionReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {item.completionReference}
                        </bdi>
                      ) : null}
                      {item.definitionVersionReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {item.definitionVersionReference}
                        </bdi>
                      ) : null}
                      {item.evidenceReferences.map((reference) => (
                        <bdi className={styles.reference} dir="ltr" key={reference}>
                          {reference}
                        </bdi>
                      ))}
                    </div>
                    {visibility.review_item ? (
                      <button
                        className={styles.secondaryAction}
                        type="button"
                        disabled={
                          !isCompletionAdherenceMonitoringIntentEnabled(
                            state,
                            'review_item',
                            snapshot,
                            item,
                          )
                        }
                        onClick={() => emitIntent('review_item', item)}
                      >
                        {copy.intentLabels.review_item}
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
            data-region="evidence-audit-context"
            aria-labelledby="completion-monitoring-evidence-heading"
          >
            <h2 id="completion-monitoring-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="completion-monitoring-consequence-heading"
          >
            <h2 id="completion-monitoring-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="completion-monitoring-actions-heading"
          >
            <h2 id="completion-monitoring-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter((kind) => kind !== 'review_item')
                .map((kind) => (
                  <button
                    className={
                      kind === 'refresh_monitoring' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isCompletionAdherenceMonitoringIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="completion-monitoring-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="completion-monitoring-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="completion-monitoring-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="completion-monitoring-help-heading">
            <h2 id="completion-monitoring-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
