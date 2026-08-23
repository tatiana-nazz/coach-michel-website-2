'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createIncidentIntakeIntent,
  getIncidentIntakeViewModel,
  isIncidentIntakeIntentEnabled,
  type IncidentIntakeContent,
  type IncidentIntakeCopy,
  type IncidentIntakeIntent,
  type IncidentIntakeIntentKind,
  type IncidentIntakeSnapshot,
  type IncidentIntakeState,
  type IncidentIntakeVisibility,
} from './incident-intake.model';
import styles from './incident-intake.module.css';

export interface IncidentIntakeProps {
  readonly locale: SupportedLocale;
  readonly state: IncidentIntakeState;
  readonly snapshot: IncidentIntakeSnapshot;
  readonly copy: IncidentIntakeCopy;
  readonly content: IncidentIntakeContent;
  readonly visibility: IncidentIntakeVisibility;
  readonly onCategoryReferenceChange: (reference: string | undefined) => void;
  readonly onIntent: (intent: IncidentIntakeIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

const globalIntentKinds = [
  'submit_incident_classification',
  'refresh_context',
  'retry',
  'reconcile',
] as const satisfies readonly IncidentIntakeIntentKind[];

function selectedValue(value: string): string | undefined {
  return value.length === 0 ? undefined : value;
}

export function IncidentIntake({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onCategoryReferenceChange,
  onIntent,
}: IncidentIntakeProps) {
  const viewModel = getIncidentIntakeViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const selectedCategory = snapshot.categories.find(
    (category) => category.categoryReference === snapshot.selectedCategoryReference,
  );
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: IncidentIntakeIntentKind) {
    if (!isIncidentIntakeIntentEnabled(state, kind, snapshot)) return;
    const intent = createIncidentIntakeIntent(kind, snapshot);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-OPS-001"
      data-access-boundary="OPERATOR_RESTRICTED"
      data-role-visibility="ROL-003 ROL-004 ROL-006 ROL-007 ROL-008 ROL-009 ROL-010 ROL-011"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="incident-intake-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="incident-intake-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.workspaceReference}
            </bdi>
            {snapshot.incidentReferences.map((reference) => (
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
            aria-labelledby="incident-intake-authority-heading"
          >
            <h2 id="incident-intake-authority-heading">{copy.authorityHeading}</h2>
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
            aria-labelledby="incident-intake-task-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="incident-intake-task-heading">{copy.intakeHeading}</h2>
            <p>{content.intakeBody}</p>
            <label htmlFor="incident-intake-category">{copy.categoryLabel}</label>
            <select
              id="incident-intake-category"
              value={snapshot.selectedCategoryReference ?? ''}
              disabled={!viewModel.categorySelectionEnabled}
              aria-describedby="incident-intake-feedback"
              aria-invalid={state === 'validation_error'}
              onChange={(event) =>
                onCategoryReferenceChange(selectedValue(event.currentTarget.value))
              }
            >
              <option value="">{copy.categoryPlaceholder}</option>
              {snapshot.categories.map((category) => (
                <option key={category.categoryReference} value={category.categoryReference}>
                  {category.label}
                </option>
              ))}
            </select>
            {selectedCategory ? (
              <div className={styles.item}>
                <h3>{selectedCategory.label}</h3>
                <p>{selectedCategory.description}</p>
                <p>{selectedCategory.consequence}</p>
                <bdi className={styles.reference} dir="ltr">
                  {selectedCategory.categoryReference}
                </bdi>
              </div>
            ) : null}
            <div className={styles.referenceGroup}>
              {snapshot.affectedReferences.map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
            {visibility.review_incident_context ? (
              <button
                className={styles.secondaryAction}
                type="button"
                disabled={
                  !isIncidentIntakeIntentEnabled(state, 'review_incident_context', snapshot)
                }
                onClick={() => emitIntent('review_incident_context')}
              >
                {copy.intentLabels.review_incident_context}
              </button>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="progress-sequence"
            aria-labelledby="incident-intake-sequence-heading"
          >
            <h2 id="incident-intake-sequence-heading">{copy.categoryLabel}</h2>
            {viewModel.showContext && snapshot.categories.length > 0 ? (
              <ol className={styles.itemList}>
                {snapshot.categories.map((category) => (
                  <li className={styles.item} key={category.orderingReference}>
                    <h3>{category.label}</h3>
                    <p>{category.description}</p>
                    <bdi className={styles.reference} dir="ltr">
                      {category.categoryReference}
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
            data-region="help-recovery-external-handoff"
            aria-labelledby="incident-intake-support-heading"
          >
            <h2 id="incident-intake-support-heading">{copy.supportPrivacyHeading}</h2>
            <p>{content.supportPrivacyBody}</p>
            <div className={styles.referenceGroup}>
              {[...snapshot.supportCaseReferences, ...snapshot.privacyContextReferences].map(
                (reference) => (
                  <bdi className={styles.reference} dir="ltr" key={reference}>
                    {reference}
                  </bdi>
                ),
              )}
            </div>
            {visibility.review_support_privacy_context ? (
              <button
                className={styles.secondaryAction}
                type="button"
                disabled={
                  !isIncidentIntakeIntentEnabled(state, 'review_support_privacy_context', snapshot)
                }
                onClick={() => emitIntent('review_support_privacy_context')}
              >
                {copy.intentLabels.review_support_privacy_context}
              </button>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="incident-intake-evidence-heading"
          >
            <h2 id="incident-intake-evidence-heading">{copy.evidenceHeading}</h2>
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
            aria-labelledby="incident-intake-dependency-heading"
          >
            <h2 id="incident-intake-dependency-heading">{copy.dependencyHeading}</h2>
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
            aria-labelledby="incident-intake-consequence-heading"
          >
            <h2 id="incident-intake-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="incident-intake-actions-heading"
          >
            <h2 id="incident-intake-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {globalIntentKinds
                .filter((kind) => viewModel.visibleIntents.includes(kind))
                .map((kind) => (
                  <button
                    className={
                      kind === 'submit_incident_classification'
                        ? styles.primaryAction
                        : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={!isIncidentIntakeIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="incident-intake-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="incident-intake-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="incident-intake-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="incident-intake-help-heading">
            <h2 id="incident-intake-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
