'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createRecoveryOperationIntent,
  getRecoveryOperationViewModel,
  isRecoveryOperationIntentEnabled,
  type RecoveryOperationContent,
  type RecoveryOperationCopy,
  type RecoveryOperationIntent,
  type RecoveryOperationIntentKind,
  type RecoveryOperationSnapshot,
  type RecoveryOperationState,
  type RecoveryOperationVisibility,
} from './recovery-operation.model';
import styles from './recovery-operation.module.css';

export interface RecoveryOperationProps {
  readonly locale: SupportedLocale;
  readonly state: RecoveryOperationState;
  readonly snapshot: RecoveryOperationSnapshot;
  readonly copy: RecoveryOperationCopy;
  readonly content: RecoveryOperationContent;
  readonly visibility: RecoveryOperationVisibility;
  readonly onActivityOptionReferenceChange: (reference: string | undefined) => void;
  readonly onIntent: (intent: RecoveryOperationIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

const globalIntentKinds = [
  'submit_recovery_activity',
  'external_handoff',
  'refresh_context',
  'retry',
  'reconcile',
] as const satisfies readonly RecoveryOperationIntentKind[];

function selectedValue(value: string): string | undefined {
  return value.length === 0 ? undefined : value;
}

export function RecoveryOperation({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onActivityOptionReferenceChange,
  onIntent,
}: RecoveryOperationProps) {
  const viewModel = getRecoveryOperationViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const selectedActivity = snapshot.activityOptions.find(
    (option) => option.optionReference === snapshot.selectedActivityOptionReference,
  );
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: RecoveryOperationIntentKind) {
    if (!isRecoveryOperationIntentEnabled(state, kind, snapshot)) return;
    const intent = createRecoveryOperationIntent(kind, snapshot);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-OPS-002"
      data-access-boundary="OPERATOR_RESTRICTED"
      data-role-visibility="ROL-002 ROL-006 ROL-007 ROL-008 ROL-009 ROL-010 ROL-011 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="recovery-operation-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="recovery-operation-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.workspaceReference}
            </bdi>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.incidentReference}
            </bdi>
            {snapshot.recoveryActivityReferences.map((reference) => (
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
            aria-labelledby="recovery-operation-authority-heading"
          >
            <h2 id="recovery-operation-authority-heading">{copy.authorityHeading}</h2>
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
            aria-labelledby="recovery-operation-activity-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="recovery-operation-activity-heading">{copy.activityHeading}</h2>
            <p>{content.activityBody}</p>
            <label htmlFor="recovery-operation-activity">{copy.activityLabel}</label>
            <select
              id="recovery-operation-activity"
              value={snapshot.selectedActivityOptionReference ?? ''}
              disabled={!viewModel.activitySelectionEnabled}
              aria-describedby="recovery-operation-feedback"
              aria-invalid={state === 'validation_error'}
              onChange={(event) =>
                onActivityOptionReferenceChange(selectedValue(event.currentTarget.value))
              }
            >
              <option value="">{copy.activityPlaceholder}</option>
              {snapshot.activityOptions.map((option) => (
                <option key={option.optionReference} value={option.optionReference}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedActivity ? (
              <div className={styles.item}>
                <h3>{selectedActivity.label}</h3>
                <p>{selectedActivity.description}</p>
                <p>{selectedActivity.consequence}</p>
                <div className={styles.referenceGroup}>
                  {[
                    selectedActivity.optionReference,
                    selectedActivity.activityCategoryReference,
                    selectedActivity.governedStatusReference,
                    selectedActivity.structuredReasonReference,
                    ...selectedActivity.evidenceToolReferences,
                  ].map((reference) => (
                    <bdi className={styles.reference} dir="ltr" key={reference}>
                      {reference}
                    </bdi>
                  ))}
                </div>
              </div>
            ) : null}
            {visibility.review_incident_recovery_context ? (
              <button
                className={styles.secondaryAction}
                type="button"
                disabled={
                  !isRecoveryOperationIntentEnabled(
                    state,
                    'review_incident_recovery_context',
                    snapshot,
                  )
                }
                onClick={() => emitIntent('review_incident_recovery_context')}
              >
                {copy.intentLabels.review_incident_recovery_context}
              </button>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="progress-sequence"
            aria-labelledby="recovery-operation-sequence-heading"
          >
            <h2 id="recovery-operation-sequence-heading">{copy.activityHeading}</h2>
            {viewModel.showContext && snapshot.activityOptions.length > 0 ? (
              <ol className={styles.itemList}>
                {snapshot.activityOptions.map((option) => (
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
            data-region="governed-command-context"
            aria-labelledby="recovery-operation-command-heading"
          >
            <h2 id="recovery-operation-command-heading">{copy.commandHeading}</h2>
            <p>{content.commandBody}</p>
            <div className={styles.referenceGroup}>
              {snapshot.governedCommandReferences.map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
            {visibility.review_governed_command_context ? (
              <button
                className={styles.secondaryAction}
                type="button"
                disabled={
                  !isRecoveryOperationIntentEnabled(
                    state,
                    'review_governed_command_context',
                    snapshot,
                  )
                }
                onClick={() => emitIntent('review_governed_command_context')}
              >
                {copy.intentLabels.review_governed_command_context}
              </button>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="recovery-operation-evidence-heading"
          >
            <h2 id="recovery-operation-evidence-heading">{copy.evidenceHeading}</h2>
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
            data-region="system-state-resumption"
            aria-labelledby="recovery-operation-dependency-heading"
          >
            <h2 id="recovery-operation-dependency-heading">{copy.dependencyHeading}</h2>
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
            data-region="help-recovery-external-handoff"
            aria-labelledby="recovery-operation-handoff-heading"
          >
            <h2 id="recovery-operation-handoff-heading">{copy.handoffHeading}</h2>
            <p>{content.handoffBody}</p>
            <div className={styles.referenceGroup}>
              {snapshot.externalHandoffCorrelationReferences.map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="recovery-operation-consequence-heading"
          >
            <h2 id="recovery-operation-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="recovery-operation-actions-heading"
          >
            <h2 id="recovery-operation-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {globalIntentKinds
                .filter((kind) => viewModel.visibleIntents.includes(kind))
                .map((kind) => (
                  <button
                    className={
                      kind === 'submit_recovery_activity'
                        ? styles.primaryAction
                        : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isRecoveryOperationIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="recovery-operation-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="recovery-operation-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="recovery-operation-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="recovery-operation-help-heading">
            <h2 id="recovery-operation-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
