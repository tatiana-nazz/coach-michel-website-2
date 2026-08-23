'use client';

import type { FormEvent } from 'react';

import type { SupportedLocale } from '@/i18n/config';

import {
  accessRecoveryFields,
  createAccessRecoveryIntent,
  getAccessRecoveryViewModel,
  isAccessRecoveryIntentEnabled,
  type AccessRecoveryAuthorityContext,
  type AccessRecoveryContent,
  type AccessRecoveryCopy,
  type AccessRecoveryField,
  type AccessRecoveryIntent,
  type AccessRecoveryIntentKind,
  type AccessRecoveryReferences,
  type AccessRecoveryState,
  type AccessRecoveryValues,
} from './access-recovery.model';
import styles from './access-recovery.module.css';

export interface AccessRecoveryProps {
  readonly locale: SupportedLocale;
  readonly state: AccessRecoveryState;
  readonly copy: AccessRecoveryCopy;
  readonly content: AccessRecoveryContent;
  readonly values: AccessRecoveryValues;
  readonly authorityContext: AccessRecoveryAuthorityContext;
  readonly references: AccessRecoveryReferences;
  readonly allowedIntents: readonly AccessRecoveryIntentKind[];
  readonly onValuesChange: (values: AccessRecoveryValues) => void;
  readonly onIntent: (intent: AccessRecoveryIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function AccessRecovery({
  locale,
  state,
  copy,
  content,
  values,
  authorityContext,
  references,
  allowedIntents,
  onValuesChange,
  onIntent,
}: AccessRecoveryProps) {
  const viewModel = getAccessRecoveryViewModel(locale, state, values, authorityContext, references);
  const stateMessage = copy.feedback[state];
  const validationInvalid = state === 'validation_error';

  function updateValue(field: AccessRecoveryField, value: string) {
    onValuesChange({ ...values, [field]: value });
  }

  function preventTransport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function emitIntent(kind: AccessRecoveryIntentKind) {
    if (isAccessRecoveryIntentEnabled(state, kind)) {
      onIntent(createAccessRecoveryIntent(kind, values, references));
    }
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-ACC-004"
      data-access-boundary="AUTHENTICATION_BOUNDARY"
      data-role-visibility="ROL-002 ROL-003 ROL-004 ROL-005 ROL-006 ROL-008 ROL-009 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="access-recovery-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="access-recovery-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="access-recovery-authority-heading"
          >
            <h2 id="access-recovery-authority-heading">{copy.authorityHeading}</h2>
            <p>{content.authorityBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="primary-task"
            aria-labelledby="access-recovery-primary-heading"
          >
            <h2 id="access-recovery-primary-heading">{copy.primaryHeading}</h2>
            <form
              className={styles.form}
              aria-describedby="access-recovery-feedback"
              aria-busy={state === 'pending'}
              onSubmit={preventTransport}
            >
              {viewModel.showInputs
                ? accessRecoveryFields.map((field) => {
                    const inputId = `access-recovery-${field}`;
                    const descriptionId = `${inputId}-description`;

                    return (
                      <div className={styles.field} key={field}>
                        <label htmlFor={inputId}>{copy.fieldLabels[field]}</label>
                        <input
                          id={inputId}
                          name={field}
                          value={values[field]}
                          dir={field === 'minimumRecoveryLocatorEvidence' ? 'ltr' : undefined}
                          aria-invalid={validationInvalid}
                          aria-describedby={`${descriptionId} access-recovery-feedback`}
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
                    className={kind === 'initiate' ? styles.primaryAction : styles.secondaryAction}
                    key={kind}
                    type="submit"
                    disabled={!isAccessRecoveryIntentEnabled(state, kind)}
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
            aria-labelledby="access-recovery-consequence-heading"
          >
            <h2 id="access-recovery-consequence-heading">{copy.consequenceHeading}</h2>
            <p>{content.consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="help-recovery"
            aria-labelledby="access-recovery-reference-heading"
          >
            <h2 id="access-recovery-reference-heading">{copy.recoveryReferenceHeading}</h2>
            {references.recoveryReference ? (
              <bdi className={styles.reference} dir="ltr">
                {references.recoveryReference}
              </bdi>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="external-handoff"
            aria-labelledby="access-recovery-handoff-heading"
          >
            <h2 id="access-recovery-handoff-heading">{copy.externalHandoffHeading}</h2>
            <p>{content.externalHandoffBody}</p>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="validation-feedback"
            data-presentation-state={state}
            aria-labelledby="access-recovery-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="access-recovery-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="access-recovery-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="access-recovery-help-heading">
            <h2 id="access-recovery-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
