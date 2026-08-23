'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createAdminAccountNoticesExternalEscalationIntent,
  getAdminAccountNoticesExternalEscalationViewModel,
  isAdminAccountNoticesExternalEscalationIntentEnabled,
  type AdminAccountNotice,
  type AdminAccountNoticesExternalEscalationContent,
  type AdminAccountNoticesExternalEscalationCopy,
  type AdminAccountNoticesExternalEscalationIntent,
  type AdminAccountNoticesExternalEscalationIntentKind,
  type AdminAccountNoticesExternalEscalationSnapshot,
  type AdminAccountNoticesExternalEscalationState,
  type AdminAccountNoticesExternalEscalationVisibility,
  type AdminExternalHandoffOption,
  type AdminPolicyApprovalContext,
  type AdminSupportPrivacyCase,
} from './admin-account-notices-external-escalation.model';
import styles from './admin-account-notices-external-escalation.module.css';

export interface AdminAccountNoticesExternalEscalationProps {
  readonly locale: SupportedLocale;
  readonly state: AdminAccountNoticesExternalEscalationState;
  readonly snapshot: AdminAccountNoticesExternalEscalationSnapshot;
  readonly copy: AdminAccountNoticesExternalEscalationCopy;
  readonly content: AdminAccountNoticesExternalEscalationContent;
  readonly visibility: AdminAccountNoticesExternalEscalationVisibility;
  readonly onExternalHandoffOptionReferenceChange: (reference: string | undefined) => void;
  readonly onIntent: (intent: AdminAccountNoticesExternalEscalationIntent) => void;
}

type AdminContextItem =
  | AdminAccountNotice
  | AdminPolicyApprovalContext
  | AdminSupportPrivacyCase
  | AdminExternalHandoffOption;

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

const globalIntentKinds = [
  'external_handoff',
  'refresh_context',
  'retry',
  'reconcile',
] as const satisfies readonly AdminAccountNoticesExternalEscalationIntentKind[];

function selectedValue(value: string): string | undefined {
  return value.length === 0 ? undefined : value;
}

export function AdminAccountNoticesExternalEscalation({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onExternalHandoffOptionReferenceChange,
  onIntent,
}: AdminAccountNoticesExternalEscalationProps) {
  const viewModel = getAdminAccountNoticesExternalEscalationViewModel(
    locale,
    state,
    snapshot,
    visibility,
  );
  const stateMessage = copy.feedback[state];
  const selectedHandoff = snapshot.externalHandoffOptions.find(
    (option) => option.optionReference === snapshot.selectedExternalHandoffOptionReference,
  );
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(
    kind: AdminAccountNoticesExternalEscalationIntentKind,
    item?: AdminContextItem,
  ) {
    if (!isAdminAccountNoticesExternalEscalationIntentEnabled(state, kind, snapshot, item)) {
      return;
    }
    const intent = createAdminAccountNoticesExternalEscalationIntent(kind, snapshot, item);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-010"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-001 ROL-002 ROL-003 ROL-004 ROL-005 ROL-006 ROL-007 ROL-008 ROL-009 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="admin-account-handoff-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="admin-account-handoff-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.workspaceReference}
            </bdi>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.accountReference}
            </bdi>
          </div>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="admin-account-handoff-authority-heading"
          >
            <h2 id="admin-account-handoff-authority-heading">{copy.authorityHeading}</h2>
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
            aria-labelledby="admin-account-handoff-admin-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="admin-account-handoff-admin-heading">{copy.adminHeading}</h2>
            <p>{content.adminBody}</p>
            <div className={styles.referenceGroup}>
              {snapshot.adminContextReferences.map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
            {visibility.review_admin_context ? (
              <button
                className={styles.secondaryAction}
                type="button"
                disabled={
                  !isAdminAccountNoticesExternalEscalationIntentEnabled(
                    state,
                    'review_admin_context',
                    snapshot,
                  )
                }
                onClick={() => emitIntent('review_admin_context')}
              >
                {copy.intentLabels.review_admin_context}
              </button>
            ) : null}

            <div className={styles.subsection}>
              <h3>{copy.policyApprovalHeading}</h3>
              <p>{content.policyApprovalBody}</p>
              {viewModel.showContext && snapshot.policyApprovalContexts.length > 0 ? (
                <ol className={styles.itemList}>
                  {snapshot.policyApprovalContexts.map((context) => (
                    <li className={styles.item} key={context.orderingReference}>
                      <h4>{context.heading}</h4>
                      <strong>{context.statusLabel}</strong>
                      <p>{context.summary}</p>
                      <div className={styles.referenceGroup}>
                        <bdi className={styles.reference} dir="ltr">
                          {context.contextReference}
                        </bdi>
                        {context.subjectVersionReference ? (
                          <bdi className={styles.reference} dir="ltr">
                            {context.subjectVersionReference}
                          </bdi>
                        ) : null}
                        {context.policyReference ? (
                          <bdi className={styles.reference} dir="ltr">
                            {context.policyReference}
                          </bdi>
                        ) : null}
                        {context.approvalReference ? (
                          <bdi className={styles.reference} dir="ltr">
                            {context.approvalReference}
                          </bdi>
                        ) : null}
                        {context.evidenceReferences.map((reference) => (
                          <bdi className={styles.reference} dir="ltr" key={reference}>
                            {reference}
                          </bdi>
                        ))}
                      </div>
                      {visibility.review_policy_approval_context ? (
                        <button
                          className={styles.secondaryAction}
                          type="button"
                          disabled={
                            !isAdminAccountNoticesExternalEscalationIntentEnabled(
                              state,
                              'review_policy_approval_context',
                              snapshot,
                              context,
                            )
                          }
                          onClick={() => emitIntent('review_policy_approval_context', context)}
                        >
                          {copy.intentLabels.review_policy_approval_context}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{stateMessage}</p>
              )}
            </div>

            <div className={styles.subsection}>
              <h3>{copy.supportCasesHeading}</h3>
              <p>{content.supportCasesBody}</p>
              {viewModel.showContext && snapshot.supportPrivacyCases.length > 0 ? (
                <ol className={styles.itemList}>
                  {snapshot.supportPrivacyCases.map((caseItem) => (
                    <li className={styles.item} key={caseItem.orderingReference}>
                      <h4>{caseItem.heading}</h4>
                      <strong>{caseItem.statusLabel}</strong>
                      <p>{caseItem.summary}</p>
                      <div className={styles.referenceGroup}>
                        <bdi className={styles.reference} dir="ltr">
                          {caseItem.caseReference}
                        </bdi>
                        {caseItem.purposeScopeReference ? (
                          <bdi className={styles.reference} dir="ltr">
                            {caseItem.purposeScopeReference}
                          </bdi>
                        ) : null}
                        {caseItem.evidenceReferences.map((reference) => (
                          <bdi className={styles.reference} dir="ltr" key={reference}>
                            {reference}
                          </bdi>
                        ))}
                      </div>
                      {visibility.review_support_case ? (
                        <button
                          className={styles.secondaryAction}
                          type="button"
                          disabled={
                            !isAdminAccountNoticesExternalEscalationIntentEnabled(
                              state,
                              'review_support_case',
                              snapshot,
                              caseItem,
                            )
                          }
                          onClick={() => emitIntent('review_support_case', caseItem)}
                        >
                          {copy.intentLabels.review_support_case}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{stateMessage}</p>
              )}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="admin-account-handoff-notices-heading"
          >
            <h2 id="admin-account-handoff-notices-heading">{copy.noticesHeading}</h2>
            <p>{content.noticesBody}</p>
            {viewModel.showContext && snapshot.notices.length > 0 ? (
              <ol className={styles.itemList}>
                {snapshot.notices.map((notice) => (
                  <li className={styles.item} key={notice.orderingReference}>
                    <h3>{notice.heading}</h3>
                    <strong>{notice.statusLabel}</strong>
                    <p>{notice.body}</p>
                    <div className={styles.referenceGroup}>
                      <bdi className={styles.reference} dir="ltr">
                        {notice.noticeReference}
                      </bdi>
                      {notice.disclosureVersionReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {notice.disclosureVersionReference}
                        </bdi>
                      ) : null}
                      {notice.effectiveTimeContext ? (
                        <bdi className={styles.reference} dir="ltr">
                          {notice.effectiveTimeContext}
                        </bdi>
                      ) : null}
                    </div>
                    {visibility.review_notice ? (
                      <button
                        className={styles.secondaryAction}
                        type="button"
                        disabled={
                          !isAdminAccountNoticesExternalEscalationIntentEnabled(
                            state,
                            'review_notice',
                            snapshot,
                            notice,
                          )
                        }
                        onClick={() => emitIntent('review_notice', notice)}
                      >
                        {copy.intentLabels.review_notice}
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
            data-region="help-recovery-external-handoff"
            aria-labelledby="admin-account-handoff-external-heading"
          >
            <h2 id="admin-account-handoff-external-heading">{copy.handoffHeading}</h2>
            <p>{content.handoffBody}</p>
            <label htmlFor="admin-account-handoff-option">{copy.handoffLabel}</label>
            <select
              id="admin-account-handoff-option"
              value={snapshot.selectedExternalHandoffOptionReference ?? ''}
              disabled={!viewModel.handoffSelectionEnabled}
              aria-describedby="admin-account-handoff-feedback"
              aria-invalid={state === 'validation_error'}
              onChange={(event) =>
                onExternalHandoffOptionReferenceChange(selectedValue(event.currentTarget.value))
              }
            >
              <option value="">{copy.handoffPlaceholder}</option>
              {snapshot.externalHandoffOptions.map((option) => (
                <option key={option.optionReference} value={option.optionReference}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedHandoff ? (
              <div className={styles.handoffContext}>
                <p>{selectedHandoff.description}</p>
                <p>{selectedHandoff.consequence}</p>
                <div className={styles.referenceGroup}>
                  <bdi className={styles.reference} dir="ltr">
                    {selectedHandoff.optionReference}
                  </bdi>
                  <bdi className={styles.reference} dir="ltr">
                    {selectedHandoff.correlationReference}
                  </bdi>
                  <bdi className={styles.reference} dir="ltr">
                    {selectedHandoff.minimumBusinessIntentReference}
                  </bdi>
                  <bdi className={styles.reference} dir="ltr">
                    {selectedHandoff.purposeContextReference}
                  </bdi>
                </div>
              </div>
            ) : null}
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="admin-account-handoff-consequence-heading"
          >
            <h2 id="admin-account-handoff-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="admin-account-handoff-actions-heading"
          >
            <h2 id="admin-account-handoff-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {globalIntentKinds
                .filter((kind) => viewModel.visibleIntents.includes(kind))
                .map((kind) => (
                  <button
                    className={
                      kind === 'external_handoff' ? styles.primaryAction : styles.secondaryAction
                    }
                    key={kind}
                    type="button"
                    disabled={
                      !isAdminAccountNoticesExternalEscalationIntentEnabled(state, kind, snapshot)
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
            aria-labelledby="admin-account-handoff-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="admin-account-handoff-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="admin-account-handoff-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="admin-account-handoff-help-heading">
            <h2 id="admin-account-handoff-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
