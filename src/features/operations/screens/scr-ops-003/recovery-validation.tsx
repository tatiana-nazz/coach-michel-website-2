'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createRecoveryValidationIntent,
  getRecoveryValidationViewModel,
  isRecoveryValidationIntentEnabled,
  type RecoveryValidationContent,
  type RecoveryValidationCopy,
  type RecoveryValidationIntent,
  type RecoveryValidationIntentKind,
  type RecoveryValidationObjective,
  type RecoveryValidationSnapshot,
  type RecoveryValidationState,
  type RecoveryValidationVisibility,
} from './recovery-validation.model';
import styles from './recovery-validation.module.css';

export interface RecoveryValidationProps {
  readonly locale: SupportedLocale;
  readonly state: RecoveryValidationState;
  readonly snapshot: RecoveryValidationSnapshot;
  readonly copy: RecoveryValidationCopy;
  readonly content: RecoveryValidationContent;
  readonly visibility: RecoveryValidationVisibility;
  readonly onDecisionOptionReferenceChange: (reference: string | undefined) => void;
  readonly onIntent: (intent: RecoveryValidationIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

const globalIntentKinds = [
  'submit_validation',
  'refresh_context',
  'retry',
  'reconcile',
] as const satisfies readonly RecoveryValidationIntentKind[];

function selectedValue(value: string): string | undefined {
  return value.length === 0 ? undefined : value;
}

export function RecoveryValidation({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onDecisionOptionReferenceChange,
  onIntent,
}: RecoveryValidationProps) {
  const viewModel = getRecoveryValidationViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const selectedDecision = snapshot.decisions.find(
    (decision) => decision.optionReference === snapshot.selectedDecisionOptionReference,
  );
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: RecoveryValidationIntentKind, objective?: RecoveryValidationObjective) {
    if (!isRecoveryValidationIntentEnabled(state, kind, snapshot, objective)) return;
    const intent = createRecoveryValidationIntent(kind, snapshot, objective);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-OPS-003"
      data-access-boundary="OPERATOR_RESTRICTED"
      data-role-visibility="ROL-006 ROL-007 ROL-009 ROL-010 ROL-011"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="recovery-validation-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="recovery-validation-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.workspaceReference}
            </bdi>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.recoveryActivityReference}
            </bdi>
            {snapshot.validationReferences.map((reference) => (
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
            aria-labelledby="recovery-validation-authority-heading"
          >
            <h2 id="recovery-validation-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <div className={styles.referenceGroup}>
              {[
                snapshot.validatorStatusReference,
                snapshot.authorityStatusReference,
                snapshot.lifecycleStatusReference,
              ].map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="primary-task-information"
            aria-labelledby="recovery-validation-activity-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="recovery-validation-activity-heading">{copy.activityHeading}</h2>
            <p>{content.activityBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.recoveryActivityReference}
            </bdi>
            {visibility.review_recovery_activity_context ? (
              <button
                className={styles.secondaryAction}
                type="button"
                disabled={
                  !isRecoveryValidationIntentEnabled(
                    state,
                    'review_recovery_activity_context',
                    snapshot,
                  )
                }
                onClick={() => emitIntent('review_recovery_activity_context')}
              >
                {copy.intentLabels.review_recovery_activity_context}
              </button>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="progress-sequence"
            aria-labelledby="recovery-validation-objectives-heading"
          >
            <h2 id="recovery-validation-objectives-heading">{copy.objectivesHeading}</h2>
            <p>{content.objectivesBody}</p>
            {viewModel.showContext && snapshot.objectives.length > 0 ? (
              <ol className={styles.itemList}>
                {snapshot.objectives.map((objective) => (
                  <li className={styles.item} key={objective.orderingReference}>
                    <h3>{objective.heading}</h3>
                    <strong>{objective.statusLabel}</strong>
                    <p>{objective.summary}</p>
                    <div className={styles.referenceGroup}>
                      <bdi className={styles.reference} dir="ltr">
                        {objective.objectiveReference}
                      </bdi>
                      {objective.priorConfirmationEvidenceReferences.map((reference) => (
                        <bdi className={styles.reference} dir="ltr" key={reference}>
                          {reference}
                        </bdi>
                      ))}
                    </div>
                    {visibility.review_objective ? (
                      <button
                        className={styles.secondaryAction}
                        type="button"
                        disabled={
                          !isRecoveryValidationIntentEnabled(
                            state,
                            'review_objective',
                            snapshot,
                            objective,
                          )
                        }
                        onClick={() => emitIntent('review_objective', objective)}
                      >
                        {copy.intentLabels.review_objective}
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
            data-region="outcome-confirmation"
            aria-labelledby="recovery-validation-decision-heading"
          >
            <h2 id="recovery-validation-decision-heading">{copy.decisionHeading}</h2>
            <p>{content.decisionBody}</p>
            <label htmlFor="recovery-validation-decision">{copy.decisionLabel}</label>
            <select
              id="recovery-validation-decision"
              value={snapshot.selectedDecisionOptionReference ?? ''}
              disabled={!viewModel.decisionSelectionEnabled}
              aria-describedby="recovery-validation-feedback"
              aria-invalid={state === 'validation_error'}
              onChange={(event) =>
                onDecisionOptionReferenceChange(selectedValue(event.currentTarget.value))
              }
            >
              <option value="">{copy.decisionPlaceholder}</option>
              {snapshot.decisions.map((decision) => (
                <option key={decision.optionReference} value={decision.optionReference}>
                  {decision.label}
                </option>
              ))}
            </select>
            {selectedDecision ? (
              <div className={styles.item}>
                <h3>{selectedDecision.label}</h3>
                <p>{selectedDecision.description}</p>
                <p>{selectedDecision.consequence}</p>
                <div className={styles.referenceGroup}>
                  {[
                    selectedDecision.optionReference,
                    selectedDecision.decisionCategoryReference,
                    selectedDecision.structuredReasonReference,
                    ...selectedDecision.independenceExceptionEvidenceReferences,
                  ].map((reference) => (
                    <bdi className={styles.reference} dir="ltr" key={reference}>
                      {reference}
                    </bdi>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="recovery-validation-evidence-heading"
          >
            <h2 id="recovery-validation-evidence-heading">{copy.evidenceHeading}</h2>
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
            aria-labelledby="recovery-validation-dependency-heading"
          >
            <h2 id="recovery-validation-dependency-heading">{copy.dependencyHeading}</h2>
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
            aria-labelledby="recovery-validation-consequence-heading"
          >
            <h2 id="recovery-validation-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="recovery-validation-actions-heading"
          >
            <h2 id="recovery-validation-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {globalIntentKinds
                .filter((kind) => viewModel.visibleIntents.includes(kind))
                .map((kind) => (
                  <button
                    className={
                      kind === 'submit_validation' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isRecoveryValidationIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="recovery-validation-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="recovery-validation-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="recovery-validation-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="recovery-validation-help-heading">
            <h2 id="recovery-validation-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
