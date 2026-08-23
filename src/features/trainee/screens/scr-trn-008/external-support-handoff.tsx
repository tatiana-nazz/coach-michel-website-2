'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createExternalSupportHandoffIntent,
  getExternalSupportHandoffViewModel,
  isExternalSupportHandoffIntentEnabled,
  type ExternalSupportHandoffContent,
  type ExternalSupportHandoffCopy,
  type ExternalSupportHandoffIntent,
  type ExternalSupportHandoffIntentKind,
  type ExternalSupportHandoffSnapshot,
  type ExternalSupportHandoffState,
  type ExternalSupportHandoffVisibility,
} from './external-support-handoff.model';
import styles from './external-support-handoff.module.css';

export interface ExternalSupportHandoffProps {
  readonly locale: SupportedLocale;
  readonly state: ExternalSupportHandoffState;
  readonly snapshot: ExternalSupportHandoffSnapshot;
  readonly copy: ExternalSupportHandoffCopy;
  readonly content: ExternalSupportHandoffContent;
  readonly visibility: ExternalSupportHandoffVisibility;
  readonly onRequestCategoryChange: (categoryReference: string) => void;
  readonly onRouteStatusChange: (statusReference: string) => void;
  readonly onStructuredReasonChange: (reasonReference: string) => void;
  readonly onIntent: (intent: ExternalSupportHandoffIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function ExternalSupportHandoff({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onRequestCategoryChange,
  onRouteStatusChange,
  onStructuredReasonChange,
  onIntent,
}: ExternalSupportHandoffProps) {
  const viewModel = getExternalSupportHandoffViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localAcknowledgementConsequenceBody,
    routed: content.routedConsequenceBody,
    handoff: content.handoffConsequenceBody,
    durable_final: content.durableFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: ExternalSupportHandoffIntentKind) {
    if (!isExternalSupportHandoffIntentEnabled(state, kind, snapshot)) {
      return;
    }

    const intent = createExternalSupportHandoffIntent(kind, snapshot);
    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-TRN-008"
      data-access-boundary="TRAINEE_PRIVATE"
      data-role-visibility="ROL-002 ROL-003 ROL-004 ROL-008 ROL-009 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="external-support-handoff-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="external-support-handoff-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="external-support-authority-heading"
          >
            <h2 id="external-support-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.boundedPrincipalContextReference}
            </bdi>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="external-support-request-heading"
          >
            <h2 id="external-support-request-heading">{copy.requestHeading}</h2>
            <p>{content.requestBody}</p>
            <label className={styles.controlLabel} htmlFor="external-support-request-category">
              {copy.requestCategoryLabel}
            </label>
            <select
              className={styles.select}
              id="external-support-request-category"
              value={snapshot.selectedRequestCategoryReference ?? ''}
              disabled={!viewModel.selectionEnabled}
              aria-describedby="external-support-feedback"
              aria-invalid={state === 'validation_error'}
              onChange={(event) => onRequestCategoryChange(event.currentTarget.value)}
            >
              <option value="" disabled>
                {copy.requestCategoryPlaceholder}
              </option>
              {snapshot.requestCategoryOptions.map((option) => (
                <option key={option.categoryReference} value={option.categoryReference}>
                  {option.label}
                </option>
              ))}
            </select>
            <ul className={styles.optionDetails}>
              {snapshot.requestCategoryOptions.map((option) => (
                <li key={option.categoryReference}>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                  <bdi className={styles.reference} dir="ltr">
                    {option.categoryReference}
                  </bdi>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.region}
            data-region="minimum-routing-facts"
            aria-labelledby="external-support-routing-facts-heading"
          >
            <h2 id="external-support-routing-facts-heading">{copy.routingFactsHeading}</h2>
            <dl className={styles.factList}>
              {snapshot.minimumRoutingFacts.map((fact) => (
                <div key={fact.factReference}>
                  <dt>{fact.label}</dt>
                  <dd>
                    <bdi dir="ltr">{fact.value}</bdi>
                    <bdi className={styles.reference} dir="ltr">
                      {fact.factReference}
                    </bdi>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            className={styles.region}
            data-region="routing-escalation"
            aria-labelledby="external-support-routing-heading"
          >
            <h2 id="external-support-routing-heading">{copy.routingHeading}</h2>
            <p>{content.routingBody}</p>
            <div className={styles.controlGrid}>
              <label className={styles.controlLabel} htmlFor="external-support-route-status">
                {copy.routeStatusLabel}
              </label>
              <select
                className={styles.select}
                id="external-support-route-status"
                value={snapshot.selectedRouteStatusReference ?? ''}
                disabled={!viewModel.selectionEnabled}
                aria-describedby="external-support-feedback"
                aria-invalid={state === 'validation_error'}
                onChange={(event) => onRouteStatusChange(event.currentTarget.value)}
              >
                <option value="" disabled>
                  {copy.routeStatusPlaceholder}
                </option>
                {snapshot.routeStatusOptions.map((option) => (
                  <option key={option.optionReference} value={option.optionReference}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className={styles.controlLabel} htmlFor="external-support-reason">
                {copy.structuredReasonLabel}
              </label>
              <select
                className={styles.select}
                id="external-support-reason"
                value={snapshot.selectedStructuredReasonReference ?? ''}
                disabled={!viewModel.selectionEnabled}
                aria-describedby="external-support-feedback"
                aria-invalid={state === 'validation_error'}
                onChange={(event) => onStructuredReasonChange(event.currentTarget.value)}
              >
                <option value="" disabled>
                  {copy.structuredReasonPlaceholder}
                </option>
                {snapshot.structuredReasonOptions.map((option) => (
                  <option key={option.optionReference} value={option.optionReference}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {snapshot.caseReference ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.caseReference}
              </bdi>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="integrity-evidence"
            aria-labelledby="external-support-evidence-heading"
          >
            <h2 id="external-support-evidence-heading">{copy.evidenceHeading}</h2>
            <ul className={styles.referenceList}>
              {snapshot.minimumEvidenceReferences.map((reference) => (
                <li key={reference}>
                  <bdi className={styles.reference} dir="ltr">
                    {reference}
                  </bdi>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.region}
            data-region="external-handoff"
            aria-labelledby="external-support-handoff-heading"
          >
            <h2 id="external-support-handoff-heading">{copy.handoffHeading}</h2>
            <p>{content.handoffBody}</p>
            {snapshot.handoffContext ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.handoffContext.correlationReference}
              </bdi>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="handoff-consequences"
            aria-labelledby="external-support-consequences-heading"
          >
            <h2 id="external-support-consequences-heading">{copy.consequencesHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="external-support-actions-heading"
          >
            <h2 id="external-support-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions} aria-busy={state === 'pending'}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'initiate_support_privacy'
                      ? styles.primaryAction
                      : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={!isExternalSupportHandoffIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="external-support-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="external-support-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="external-support-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="external-support-help-heading"
          >
            <h2 id="external-support-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
