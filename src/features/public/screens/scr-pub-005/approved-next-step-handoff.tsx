'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createApprovedNextStepHandoffIntent,
  getApprovedNextStepHandoffViewModel,
  isApprovedNextStepHandoffIntentEnabled,
  type ApprovedNextStepHandoffContent,
  type ApprovedNextStepHandoffCopy,
  type ApprovedNextStepHandoffExternalContext,
  type ApprovedNextStepHandoffIntent,
  type ApprovedNextStepHandoffIntentKind,
  type ApprovedNextStepHandoffRoleCapabilityVisibility,
  type ApprovedNextStepHandoffState,
  type ApprovedNextStepHandoffSupportPrivacyContext,
  type ApprovedNextStepOption,
} from './approved-next-step-handoff.model';
import styles from './approved-next-step-handoff.module.css';

export interface ApprovedNextStepHandoffProps {
  readonly locale: SupportedLocale;
  readonly state: ApprovedNextStepHandoffState;
  readonly copy: ApprovedNextStepHandoffCopy;
  readonly content: ApprovedNextStepHandoffContent;
  readonly options: readonly ApprovedNextStepOption[];
  readonly selectedOptionReference?: string;
  readonly visibility: ApprovedNextStepHandoffRoleCapabilityVisibility;
  readonly externalContext?: ApprovedNextStepHandoffExternalContext;
  readonly supportPrivacyContext?: ApprovedNextStepHandoffSupportPrivacyContext;
  readonly onSelectedOptionReferenceChange: (optionReference: string) => void;
  readonly onIntent: (intent: ApprovedNextStepHandoffIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function ApprovedNextStepHandoff({
  locale,
  state,
  copy,
  content,
  options,
  selectedOptionReference,
  visibility,
  externalContext,
  supportPrivacyContext,
  onSelectedOptionReferenceChange,
  onIntent,
}: ApprovedNextStepHandoffProps) {
  const viewModel = getApprovedNextStepHandoffViewModel(
    locale,
    state,
    options,
    selectedOptionReference,
    visibility,
    externalContext,
    supportPrivacyContext,
  );
  const selectedOption = options.find(
    (option) => option.optionReference === selectedOptionReference,
  );
  const stateMessage = copy.feedback[state];
  const validationInvalid = state === 'validation_error';

  function emitIntent(kind: ApprovedNextStepHandoffIntentKind) {
    if (
      !isApprovedNextStepHandoffIntentEnabled(
        state,
        kind,
        selectedOption,
        externalContext,
        supportPrivacyContext,
      )
    ) {
      return;
    }

    const intent = createApprovedNextStepHandoffIntent(
      kind,
      selectedOption,
      externalContext,
      supportPrivacyContext,
    );

    if (intent !== undefined) {
      onIntent(intent);
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-PUB-005"
      data-access-boundary="PUBLIC"
      data-role-visibility="ROL-001 ROL-002 ROL-003 ROL-004 ROL-008 ROL-009 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="approved-next-step-handoff-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="approved-next-step-handoff-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="approved-next-step-authority-heading"
          >
            <h2 id="approved-next-step-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="approved-next-step-options-heading"
          >
            <h2 id="approved-next-step-options-heading">{copy.optionsHeading}</h2>
            {viewModel.showOptions ? (
              <fieldset
                className={styles.options}
                aria-describedby="approved-next-step-feedback"
                aria-busy={state === 'pending'}
                aria-invalid={validationInvalid}
              >
                <legend>{copy.optionsLegend}</legend>
                {options.map((option) => {
                  const optionId = `approved-next-step-${option.optionReference}`;
                  const descriptionId = `${optionId}-description`;

                  return (
                    <label
                      className={styles.option}
                      data-option-category={option.category}
                      data-option-value={option.value}
                      htmlFor={optionId}
                      key={option.optionReference}
                    >
                      <input
                        id={optionId}
                        name="approved-next-step"
                        type="radio"
                        value={option.optionReference}
                        checked={selectedOptionReference === option.optionReference}
                        disabled={!viewModel.optionSelectionEnabled}
                        aria-describedby={`${descriptionId} approved-next-step-feedback`}
                        onChange={() => onSelectedOptionReferenceChange(option.optionReference)}
                      />
                      <span className={styles.optionText}>
                        <strong>{option.heading}</strong>
                        <span id={descriptionId}>{option.description}</span>
                        <bdi className={styles.reference} dir="ltr">
                          {option.optionReference}
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
            data-region="disclosure-notice"
            aria-labelledby="approved-next-step-consequence-heading"
          >
            <h2 id="approved-next-step-consequence-heading">{copy.consequenceHeading}</h2>
            <p>
              {viewModel.durableFinal
                ? content.durableFinalConsequenceBody
                : content.localConsequenceBody}
            </p>
          </section>

          {visibility.support_privacy ? (
            <section
              className={styles.region}
              data-region="support-privacy"
              data-visibility-source="caller-role-capability"
              aria-labelledby="approved-next-step-support-heading"
            >
              <h2 id="approved-next-step-support-heading">{copy.supportPrivacyHeading}</h2>
              <p>{content.supportPrivacyBody}</p>
              {supportPrivacyContext ? (
                <bdi className={styles.reference} dir="ltr">
                  {supportPrivacyContext.caseReference}
                </bdi>
              ) : null}
            </section>
          ) : null}

          {visibility.external_handoff ? (
            <section
              className={styles.region}
              data-region="external-handoff"
              data-visibility-source="caller-role-capability"
              aria-labelledby="approved-next-step-external-heading"
            >
              <h2 id="approved-next-step-external-heading">{copy.externalHandoffHeading}</h2>
              <p>{content.externalHandoffBody}</p>
              {externalContext ? (
                <bdi className={styles.reference} dir="ltr">
                  {externalContext.correlationReference}
                </bdi>
              ) : null}
            </section>
          ) : null}

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="approved-next-step-actions-heading"
          >
            <h2 id="approved-next-step-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'request_next_step' ? styles.primaryAction : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={
                    !isApprovedNextStepHandoffIntentEnabled(
                      state,
                      kind,
                      selectedOption,
                      externalContext,
                      supportPrivacyContext,
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
            aria-labelledby="approved-next-step-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="approved-next-step-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="approved-next-step-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="approved-next-step-help-heading">
            <h2 id="approved-next-step-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
