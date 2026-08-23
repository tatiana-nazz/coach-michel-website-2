'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createConfirmationReconciliationIntent,
  getConfirmationReconciliationViewModel,
  isConfirmationReconciliationIntentEnabled,
  type ConfirmationReconciliationContent,
  type ConfirmationReconciliationCopy,
  type ConfirmationReconciliationIntent,
  type ConfirmationReconciliationIntentKind,
  type ConfirmationReconciliationProjectionContext,
  type ConfirmationReconciliationSnapshot,
  type ConfirmationReconciliationStateName,
  type ConfirmationReconciliationVisibility,
} from './confirmation-reconciliation-state.model';
import styles from './confirmation-reconciliation-state.module.css';

export interface ConfirmationReconciliationStateProps {
  readonly locale: SupportedLocale;
  readonly state: ConfirmationReconciliationStateName;
  readonly copy: ConfirmationReconciliationCopy;
  readonly content: ConfirmationReconciliationContent;
  readonly snapshot: ConfirmationReconciliationSnapshot;
  readonly visibility: ConfirmationReconciliationVisibility;
  readonly projectionContext?: ConfirmationReconciliationProjectionContext;
  readonly onIntent: (intent: ConfirmationReconciliationIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function ConfirmationReconciliationState({
  locale,
  state,
  copy,
  content,
  snapshot,
  visibility,
  projectionContext,
  onIntent,
}: ConfirmationReconciliationStateProps) {
  const viewModel = getConfirmationReconciliationViewModel(
    locale,
    state,
    snapshot,
    visibility,
    projectionContext,
  );
  const stateMessage = copy.feedback[state];
  const evidenceReferences = [
    ...snapshot.evidenceReferences,
    ...(projectionContext?.sourceEvidenceReferences ?? []),
  ];
  const consequenceBody =
    viewModel.outcomeKind === 'durable_confirmed'
      ? content.durableConfirmedBody
      : viewModel.outcomeKind === 'existing_completion'
        ? content.existingCompletionBody
        : content.localOutcomeBody;

  function emitIntent(kind: ConfirmationReconciliationIntentKind) {
    if (!isConfirmationReconciliationIntentEnabled(state, kind, snapshot, projectionContext)) {
      return;
    }

    const intent = createConfirmationReconciliationIntent(kind, snapshot, projectionContext);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-006"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-003 ROL-004 ROL-012"
      data-selected-direction-treatment="VDR_02_PROPAGATION_NOT_AUTHORIZED_FOR_THIS_SCREEN"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="confirmation-reconciliation-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="confirmation-reconciliation-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="confirmation-reconciliation-authority-heading"
          >
            <h2 id="confirmation-reconciliation-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            {snapshot.boundedRoleContext ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.boundedRoleContext}
              </bdi>
            ) : null}
          </section>

          <section
            className={styles.reconciliationRegion}
            data-region="system-state-resumption"
            aria-labelledby="confirmation-reconciliation-state-heading"
          >
            <h2 id="confirmation-reconciliation-state-heading">{copy.reconciliationHeading}</h2>
            <p>{content.reconciliationBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.scheduleCompletionOrCaseReference}
            </bdi>
            {snapshot.reconciliationReference ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.reconciliationReference}
              </bdi>
            ) : null}
          </section>

          <section
            className={styles.statusRegion}
            data-region="primary-task"
            aria-labelledby="confirmation-reconciliation-status-heading"
          >
            <h2 id="confirmation-reconciliation-status-heading">{copy.statusHeading}</h2>
            {viewModel.showSnapshot ? (
              <article className={styles.statusCard}>
                <h3>{snapshot.statusHeading}</h3>
                <p>{snapshot.statusBody}</p>
                <bdi className={styles.reference} dir="ltr">
                  {snapshot.statusReference}
                </bdi>
                {snapshot.completionReference ? (
                  <bdi className={styles.reference} dir="ltr">
                    {snapshot.completionReference}
                  </bdi>
                ) : null}
              </article>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.evidenceRegion}
            data-region="evidence-audit-context"
            aria-labelledby="confirmation-reconciliation-evidence-heading"
          >
            <h2 id="confirmation-reconciliation-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
            {evidenceReferences.length > 0 ? (
              <ul className={styles.evidenceList}>
                {evidenceReferences.map((reference, index) => (
                  <li key={`${reference}-${index}`}>
                    <bdi className={styles.reference} dir="ltr">
                      {reference}
                    </bdi>
                  </li>
                ))}
              </ul>
            ) : null}
            {projectionContext ? (
              <bdi className={styles.reference} dir="ltr">
                {projectionContext.projectionKey}
              </bdi>
            ) : null}
          </section>

          <section
            className={styles.outcomeRegion}
            data-region="outcome-consequence"
            data-outcome-kind={viewModel.outcomeKind}
            aria-labelledby="confirmation-reconciliation-consequence-heading"
          >
            <h2 id="confirmation-reconciliation-consequence-heading">{copy.consequenceHeading}</h2>
            <p>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="confirmation-reconciliation-actions-heading"
          >
            <h2 id="confirmation-reconciliation-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={kind === 'reconcile' ? styles.primaryAction : styles.secondaryAction}
                  key={kind}
                  type="button"
                  disabled={
                    !isConfirmationReconciliationIntentEnabled(
                      state,
                      kind,
                      snapshot,
                      projectionContext,
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
            aria-labelledby="confirmation-reconciliation-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="confirmation-reconciliation-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <section
            className={styles.resumptionRegion}
            data-region="recovery-resumption"
            aria-labelledby="confirmation-reconciliation-resumption-heading"
          >
            <h2 id="confirmation-reconciliation-resumption-heading">{copy.resumptionHeading}</h2>
            <p>{content.resumptionBody}</p>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="confirmation-reconciliation-help-heading"
          >
            <h2 id="confirmation-reconciliation-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
