'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createAvailableSessionOverviewIntent,
  getAvailableSessionOverviewViewModel,
  isAvailableSessionOverviewIntentEnabled,
  type AvailableSessionOverviewContent,
  type AvailableSessionOverviewCopy,
  type AvailableSessionOverviewIntent,
  type AvailableSessionOverviewIntentKind,
  type AvailableSessionOverviewState,
  type AvailableSessionOverviewVisibility,
  type AvailableSessionRecoveryContext,
  type AvailableSessionSnapshot,
} from './available-session-overview.model';
import styles from './available-session-overview.module.css';

export interface AvailableSessionOverviewProps {
  readonly locale: SupportedLocale;
  readonly state: AvailableSessionOverviewState;
  readonly copy: AvailableSessionOverviewCopy;
  readonly content: AvailableSessionOverviewContent;
  readonly snapshot: AvailableSessionSnapshot;
  readonly selectedWorkReference?: string;
  readonly visibility: AvailableSessionOverviewVisibility;
  readonly recoveryContext?: AvailableSessionRecoveryContext;
  readonly onSelectedWorkReferenceChange: (workReference: string) => void;
  readonly onIntent: (intent: AvailableSessionOverviewIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function AvailableSessionOverview({
  locale,
  state,
  copy,
  content,
  snapshot,
  selectedWorkReference,
  visibility,
  recoveryContext,
  onSelectedWorkReferenceChange,
  onIntent,
}: AvailableSessionOverviewProps) {
  const viewModel = getAvailableSessionOverviewViewModel(
    locale,
    state,
    snapshot,
    selectedWorkReference,
    visibility,
    recoveryContext,
  );
  const selectedWork = snapshot.approvedWork.find(
    (item) => item.workReference === selectedWorkReference,
  );
  const stateMessage = copy.feedback[state];

  function emitIntent(kind: AvailableSessionOverviewIntentKind) {
    if (!isAvailableSessionOverviewIntentEnabled(state, kind, selectedWork, recoveryContext)) {
      return;
    }
    const intent = createAvailableSessionOverviewIntent(
      kind,
      snapshot,
      selectedWork,
      recoveryContext,
    );
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-002"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-003"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="available-session-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="available-session-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>
        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="available-session-authority-heading"
          >
            <h2 id="available-session-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
          </section>

          <section
            className={styles.sessionRegion}
            data-region="status-summary"
            aria-labelledby="available-session-summary-heading"
          >
            <h2 id="available-session-summary-heading">{copy.sessionHeading}</h2>
            {viewModel.showSession ? (
              <article className={styles.sessionCard}>
                <h3>{snapshot.sessionHeading}</h3>
                <p className={styles.statusLabel}>{snapshot.sessionStatus}</p>
                <p>{snapshot.sessionSummary}</p>
                <bdi className={styles.reference} dir="ltr">
                  {snapshot.sessionReference}
                </bdi>
              </article>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="collection-navigation"
            aria-labelledby="available-session-work-heading"
          >
            <h2 id="available-session-work-heading">{copy.workHeading}</h2>
            {viewModel.showSession && snapshot.approvedWork.length > 0 ? (
              <fieldset
                className={styles.workList}
                aria-describedby="available-session-feedback"
                aria-invalid={state === 'validation_error'}
              >
                <legend>{copy.workLegend}</legend>
                {snapshot.approvedWork.map((item, index) => {
                  const id = `available-session-work-${index}`;
                  const descriptionId = `${id}-description`;
                  return (
                    <label className={styles.workItem} htmlFor={id} key={item.workReference}>
                      <input
                        id={id}
                        name="available-session-work"
                        type="radio"
                        value={item.workReference}
                        checked={selectedWorkReference === item.workReference}
                        disabled={!viewModel.selectionEnabled || !item.availableForIntent}
                        aria-describedby={`${descriptionId} available-session-feedback`}
                        onChange={() => onSelectedWorkReferenceChange(item.workReference)}
                      />
                      <span className={styles.workText}>
                        <strong>{item.heading}</strong>
                        <span>{item.statusLabel}</span>
                        <span id={descriptionId}>{item.description}</span>
                        <bdi className={styles.reference} dir="ltr">
                          {item.workReference}
                        </bdi>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="available-session-consequence-heading"
          >
            <h2 id="available-session-consequence-heading">{copy.consequenceHeading}</h2>
            <p>
              {viewModel.durableFinal
                ? content.durableFinalConsequenceBody
                : content.localConsequenceBody}
            </p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="available-session-actions-heading"
          >
            <h2 id="available-session-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'request_approved_work' ? styles.primaryAction : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={
                    !isAvailableSessionOverviewIntentEnabled(
                      state,
                      kind,
                      selectedWork,
                      recoveryContext,
                    )
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
            aria-labelledby="available-session-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="available-session-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="available-session-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="available-session-help-heading"
          >
            <h2 id="available-session-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
