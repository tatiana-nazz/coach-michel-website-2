'use client';

import type { FormEvent } from 'react';

import type { SupportedLocale } from '@/i18n/config';

import {
  createProvisioningInvitationIntent,
  getProvisioningInvitationEntryViewModel,
  isProvisioningIntentEnabled,
  type ProvisioningInvitationEntryContent,
  type ProvisioningInvitationEntryCopy,
  type ProvisioningInvitationEntryField,
  type ProvisioningInvitationEntryState,
  type ProvisioningInvitationEntryValues,
  type ProvisioningInvitationIntent,
  type ProvisioningInvitationIntentKind,
} from './provisioning-invitation-entry.model';
import styles from './provisioning-invitation-entry.module.css';

export interface ProvisioningInvitationEntryProps {
  readonly locale: SupportedLocale;
  readonly state: ProvisioningInvitationEntryState;
  readonly copy: ProvisioningInvitationEntryCopy;
  readonly content: ProvisioningInvitationEntryContent;
  readonly values: ProvisioningInvitationEntryValues;
  readonly visibleFields: readonly ProvisioningInvitationEntryField[];
  readonly allowedIntents: readonly ProvisioningInvitationIntentKind[];
  readonly onValuesChange: (values: ProvisioningInvitationEntryValues) => void;
  readonly onIntent: (intent: ProvisioningInvitationIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

function isOpaqueField(field: ProvisioningInvitationEntryField): boolean {
  return (
    field === 'candidateReference' ||
    field === 'invitationProvisioningEvidence' ||
    field === 'subjectAccountGrantReference' ||
    field === 'approvalExceptionEvidence'
  );
}

export function ProvisioningInvitationEntry({
  locale,
  state,
  copy,
  content,
  values,
  visibleFields,
  allowedIntents,
  onValuesChange,
  onIntent,
}: ProvisioningInvitationEntryProps) {
  const viewModel = getProvisioningInvitationEntryViewModel(locale, state, values);
  const stateMessage = copy.feedback[state];
  const validationInvalid = state === 'validation_error';

  function updateValue(field: ProvisioningInvitationEntryField, value: string) {
    onValuesChange({ ...values, [field]: value });
  }

  function emitIntent(kind: ProvisioningInvitationIntentKind) {
    if (isProvisioningIntentEnabled(state, kind)) {
      onIntent(createProvisioningInvitationIntent(kind, values));
    }
  }

  function preventTransport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-ACC-002"
      data-access-boundary="AUTHENTICATION_BOUNDARY"
      data-role-visibility="ROL-002 ROL-005 ROL-006"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="provisioning-invitation-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="provisioning-invitation-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="provisioning-authority-heading"
          >
            <h2 id="provisioning-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="provisioning-primary-heading"
          >
            <h2 id="provisioning-primary-heading">{copy.primaryHeading}</h2>

            <form
              className={styles.form}
              aria-describedby="provisioning-feedback"
              aria-busy={state === 'pending'}
              onSubmit={preventTransport}
            >
              {viewModel.showForm
                ? visibleFields.map((field) => {
                    const inputId = `provisioning-${field}`;
                    const descriptionId = `${inputId}-description`;

                    return (
                      <div className={styles.field} key={field}>
                        <label htmlFor={inputId}>{copy.fieldLabels[field]}</label>
                        <input
                          id={inputId}
                          name={field}
                          value={values[field]}
                          dir={isOpaqueField(field) ? 'ltr' : undefined}
                          aria-invalid={validationInvalid}
                          aria-describedby={`${descriptionId} provisioning-feedback`}
                          onChange={(event) => updateValue(field, event.currentTarget.value)}
                        />
                        <p className={styles.fieldHint} id={descriptionId}>
                          {copy.fieldDescriptions[field]}
                        </p>
                      </div>
                    );
                  })
                : null}

              <fieldset className={styles.actions} data-region="governed-actions">
                <legend>{copy.actionsHeading}</legend>
                {allowedIntents.map((kind) => (
                  <button
                    className={kind === 'retry' ? styles.secondaryAction : styles.primaryAction}
                    key={kind}
                    type="submit"
                    disabled={!isProvisioningIntentEnabled(state, kind)}
                    onClick={() => emitIntent(kind)}
                  >
                    {copy.intentLabels[kind]}
                  </button>
                ))}
              </fieldset>
            </form>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="provisioning-disclosure-heading"
          >
            <h2 id="provisioning-disclosure-heading">{copy.disclosureHeading}</h2>
            <p>{content.disclosureBody}</p>
            <p>{content.consequenceBody}</p>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="validation-feedback"
            data-presentation-state={state}
            aria-labelledby="provisioning-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="provisioning-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="provisioning-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            data-region="help-recovery"
            aria-labelledby="provisioning-help-heading"
          >
            <h2 id="provisioning-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
