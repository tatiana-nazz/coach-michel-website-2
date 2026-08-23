'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createCorrectionReconciliationReviewIntent,
  getCorrectionReconciliationReviewViewModel,
  isCorrectionReconciliationReviewIntentEnabled,
  type CorrectionReconciliationCase,
  type CorrectionReconciliationReviewContent,
  type CorrectionReconciliationReviewCopy,
  type CorrectionReconciliationReviewIntent,
  type CorrectionReconciliationReviewIntentKind,
  type CorrectionReconciliationReviewSnapshot,
  type CorrectionReconciliationReviewState,
  type CorrectionReconciliationReviewVisibility,
} from './correction-reconciliation-review.model';
import styles from './correction-reconciliation-review.module.css';

export interface CorrectionReconciliationReviewProps {
  readonly locale: SupportedLocale;
  readonly state: CorrectionReconciliationReviewState;
  readonly snapshot: CorrectionReconciliationReviewSnapshot;
  readonly copy: CorrectionReconciliationReviewCopy;
  readonly content: CorrectionReconciliationReviewContent;
  readonly visibility: CorrectionReconciliationReviewVisibility;
  readonly onIntent: (intent: CorrectionReconciliationReviewIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

const itemIntentKinds = [
  'review_case',
  'prepare_proposal_intent',
  'prepare_decision_intent',
  'review_audit_context',
] as const satisfies readonly CorrectionReconciliationReviewIntentKind[];

export function CorrectionReconciliationReview({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onIntent,
}: CorrectionReconciliationReviewProps) {
  const viewModel = getCorrectionReconciliationReviewViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(
    kind: CorrectionReconciliationReviewIntentKind,
    item?: CorrectionReconciliationCase,
  ) {
    if (!isCorrectionReconciliationReviewIntentEnabled(state, kind, snapshot, item)) return;
    const intent = createCorrectionReconciliationReviewIntent(kind, snapshot, item);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-009"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004 ROL-006 ROL-007 ROL-009 ROL-010 ROL-011 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="correction-reconciliation-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="correction-reconciliation-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.reviewReference}
            </bdi>
            {snapshot.boundedAuditTimeContext ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.boundedAuditTimeContext}
              </bdi>
            ) : null}
            {snapshot.continuationContext ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.continuationContext}
              </bdi>
            ) : null}
          </div>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="correction-reconciliation-authority-heading"
          >
            <h2 id="correction-reconciliation-authority-heading">{copy.authorityHeading}</h2>
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
            data-region="conflict-reconciliation"
            aria-labelledby="correction-reconciliation-cases-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="correction-reconciliation-cases-heading">{copy.casesHeading}</h2>
            <p>{content.casesBody}</p>
            {viewModel.showCases ? (
              <ol className={styles.itemList}>
                {snapshot.cases.map((item) => (
                  <li className={styles.item} key={item.orderingReference}>
                    <h3>{item.displayLabel}</h3>
                    <ul className={styles.statusList}>
                      <li>{item.statusLabel}</li>
                      <li>{item.proposalStatusLabel}</li>
                      <li>{item.decisionStatusLabel}</li>
                      <li>{item.reasonCategoryLabel}</li>
                    </ul>
                    <p>{item.summary}</p>
                    <div className={styles.referenceGroup}>
                      <bdi className={styles.reference} dir="ltr">
                        {item.caseReference}
                      </bdi>
                      {item.proposalReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {item.proposalReference}
                        </bdi>
                      ) : null}
                      {item.reasonVersionReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {item.reasonVersionReference}
                        </bdi>
                      ) : null}
                      {item.decisionReference ? (
                        <bdi className={styles.reference} dir="ltr">
                          {item.decisionReference}
                        </bdi>
                      ) : null}
                      {[
                        ...item.affectedSubjectReferences,
                        ...item.scheduleReferences,
                        ...item.evidenceReferences,
                        ...item.separationExceptionEvidenceReferences,
                        ...item.incidentRecoveryReferences,
                        ...item.auditReferences,
                      ].map((reference) => (
                        <bdi className={styles.reference} dir="ltr" key={reference}>
                          {reference}
                        </bdi>
                      ))}
                    </div>
                    <div className={styles.itemActions}>
                      {itemIntentKinds
                        .filter((kind) => visibility[kind])
                        .map((kind) => (
                          <button
                            className={styles.secondaryAction}
                            key={kind}
                            type="button"
                            disabled={
                              !isCorrectionReconciliationReviewIntentEnabled(
                                state,
                                kind,
                                snapshot,
                                item,
                              )
                            }
                            onClick={() => emitIntent(kind, item)}
                          >
                            {copy.intentLabels[kind]}
                          </button>
                        ))}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="correction-reconciliation-evidence-heading"
          >
            <h2 id="correction-reconciliation-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="correction-reconciliation-consequence-heading"
          >
            <h2 id="correction-reconciliation-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="correction-reconciliation-actions-heading"
          >
            <h2 id="correction-reconciliation-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents
                .filter((kind) => kind === 'retry' || kind === 'reconcile')
                .map((kind) => (
                  <button
                    className={styles.primaryAction}
                    key={kind}
                    type="button"
                    disabled={!isCorrectionReconciliationReviewIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="correction-reconciliation-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="correction-reconciliation-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="correction-reconciliation-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside
            className={styles.helpRegion}
            aria-labelledby="correction-reconciliation-help-heading"
          >
            <h2 id="correction-reconciliation-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
