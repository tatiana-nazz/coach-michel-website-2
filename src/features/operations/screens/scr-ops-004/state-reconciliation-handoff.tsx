'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createStateReconciliationHandoffIntent,
  getStateReconciliationHandoffViewModel,
  isStateReconciliationHandoffIntentEnabled,
  type StateReconciliationHandoffContent,
  type StateReconciliationHandoffCopy,
  type StateReconciliationHandoffIntent,
  type StateReconciliationHandoffIntentKind,
  type StateReconciliationHandoffSnapshot,
  type StateReconciliationHandoffState,
  type StateReconciliationHandoffVisibility,
} from './state-reconciliation-handoff.model';
import styles from './state-reconciliation-handoff.module.css';

export interface StateReconciliationHandoffProps {
  readonly locale: SupportedLocale;
  readonly state: StateReconciliationHandoffState;
  readonly snapshot: StateReconciliationHandoffSnapshot;
  readonly copy: StateReconciliationHandoffCopy;
  readonly content: StateReconciliationHandoffContent;
  readonly visibility: StateReconciliationHandoffVisibility;
  readonly onHandoffOptionReferenceChange: (reference: string | undefined) => void;
  readonly onIntent: (intent: StateReconciliationHandoffIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

const globalIntentKinds = [
  'submit_reconciliation_handoff',
  'refresh_derived_status',
  'refresh_context',
  'retry',
  'reconcile',
] as const satisfies readonly StateReconciliationHandoffIntentKind[];

function selectedValue(value: string): string | undefined {
  return value.length === 0 ? undefined : value;
}

export function StateReconciliationHandoff({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onHandoffOptionReferenceChange,
  onIntent,
}: StateReconciliationHandoffProps) {
  const viewModel = getStateReconciliationHandoffViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const selectedHandoff = snapshot.handoffOptions.find(
    (option) => option.optionReference === snapshot.selectedHandoffOptionReference,
  );
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: StateReconciliationHandoffIntentKind) {
    if (!isStateReconciliationHandoffIntentEnabled(state, kind, snapshot)) return;
    const intent = createStateReconciliationHandoffIntent(kind, snapshot);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-OPS-004"
      data-access-boundary="OPERATOR_RESTRICTED"
      data-role-visibility="ROL-006 ROL-007 ROL-009 ROL-010 ROL-011 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="state-reconciliation-handoff-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="state-reconciliation-handoff-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.workspaceReference}
            </bdi>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.validationReference}
            </bdi>
            {snapshot.handoffReferences.map((reference) => (
              <bdi className={styles.reference} dir="ltr" key={reference}>
                {reference}
              </bdi>
            ))}
          </div>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="state-reconciliation-handoff-authority-heading"
          >
            <h2 id="state-reconciliation-handoff-authority-heading">{copy.authorityHeading}</h2>
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
            data-region="primary-task-information"
            aria-labelledby="state-reconciliation-handoff-validation-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="state-reconciliation-handoff-validation-heading">{copy.validationHeading}</h2>
            <p>{content.validationBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.validationReference}
            </bdi>
            {visibility.review_validation_context ? (
              <button
                className={styles.secondaryAction}
                type="button"
                disabled={
                  !isStateReconciliationHandoffIntentEnabled(
                    state,
                    'review_validation_context',
                    snapshot,
                  )
                }
                onClick={() => emitIntent('review_validation_context')}
              >
                {copy.intentLabels.review_validation_context}
              </button>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="progress-sequence"
            aria-labelledby="state-reconciliation-handoff-target-heading"
          >
            <h2 id="state-reconciliation-handoff-target-heading">{copy.handoffHeading}</h2>
            <p>{content.handoffBody}</p>
            <label htmlFor="state-reconciliation-handoff-option">{copy.handoffLabel}</label>
            <select
              id="state-reconciliation-handoff-option"
              value={snapshot.selectedHandoffOptionReference ?? ''}
              disabled={!viewModel.handoffSelectionEnabled}
              aria-describedby="state-reconciliation-handoff-feedback"
              aria-invalid={state === 'validation_error'}
              onChange={(event) =>
                onHandoffOptionReferenceChange(selectedValue(event.currentTarget.value))
              }
            >
              <option value="">{copy.handoffPlaceholder}</option>
              {snapshot.handoffOptions.map((option) => (
                <option key={option.optionReference} value={option.optionReference}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedHandoff ? (
              <div className={styles.item}>
                <h3>{selectedHandoff.label}</h3>
                <p>{selectedHandoff.description}</p>
                <p>{selectedHandoff.consequence}</p>
                <div className={styles.referenceGroup}>
                  {[
                    selectedHandoff.optionReference,
                    selectedHandoff.targetHandoffCategoryReference,
                    selectedHandoff.structuredReasonReference,
                  ].map((reference) => (
                    <bdi className={styles.reference} dir="ltr" key={reference}>
                      {reference}
                    </bdi>
                  ))}
                </div>
              </div>
            ) : null}
            {viewModel.showContext && snapshot.handoffOptions.length > 0 ? (
              <ol className={styles.itemList}>
                {snapshot.handoffOptions.map((option) => (
                  <li className={styles.item} key={option.orderingReference}>
                    <h3>{option.label}</h3>
                    <p>{option.description}</p>
                    <bdi className={styles.reference} dir="ltr">
                      {option.optionReference}
                    </bdi>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="affected-subject-schedule"
            aria-labelledby="state-reconciliation-handoff-affected-heading"
          >
            <h2 id="state-reconciliation-handoff-affected-heading">
              {copy.affectedContextHeading}
            </h2>
            <p>{content.affectedContextBody}</p>
            <div className={styles.referenceGroup}>
              {[...snapshot.affectedSubjectReferences, ...snapshot.affectedScheduleReferences].map(
                (reference) => (
                  <bdi className={styles.reference} dir="ltr" key={reference}>
                    {reference}
                  </bdi>
                ),
              )}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="state-reconciliation-handoff-evidence-heading"
          >
            <h2 id="state-reconciliation-handoff-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
            <div className={styles.referenceGroup}>
              {[...snapshot.evidenceReferences, ...snapshot.auditReferences].map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="conflict-reconciliation"
            aria-labelledby="state-reconciliation-handoff-reconciliation-heading"
          >
            <h2 id="state-reconciliation-handoff-reconciliation-heading">
              {copy.reconciliationHeading}
            </h2>
            <p>{content.reconciliationBody}</p>
            <div className={styles.referenceGroup}>
              {[...snapshot.derivedStatusReferences, ...snapshot.reconciliationReferences].map(
                (reference) => (
                  <bdi className={styles.reference} dir="ltr" key={reference}>
                    {reference}
                  </bdi>
                ),
              )}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="system-state-resumption"
            aria-labelledby="state-reconciliation-handoff-dependency-heading"
          >
            <h2 id="state-reconciliation-handoff-dependency-heading">{copy.dependencyHeading}</h2>
            <p>{content.dependencyBody}</p>
            <div className={styles.referenceGroup}>
              {snapshot.dependencyReferences.map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="state-reconciliation-handoff-consequence-heading"
          >
            <h2 id="state-reconciliation-handoff-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="state-reconciliation-handoff-actions-heading"
          >
            <h2 id="state-reconciliation-handoff-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {globalIntentKinds
                .filter((kind) => viewModel.visibleIntents.includes(kind))
                .map((kind) => (
                  <button
                    className={
                      kind === 'submit_reconciliation_handoff'
                        ? styles.primaryAction
                        : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isStateReconciliationHandoffIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="state-reconciliation-handoff-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="state-reconciliation-handoff-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="state-reconciliation-handoff-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery-external-handoff"
            aria-labelledby="state-reconciliation-handoff-help-heading"
          >
            <h2 id="state-reconciliation-handoff-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
