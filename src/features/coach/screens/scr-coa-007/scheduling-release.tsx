'use client';

import type { SupportedLocale } from '@/i18n/config';

import {
  createSchedulingReleaseIntent,
  getSchedulingReleaseViewModel,
  isSchedulingReleaseIntentEnabled,
  type SchedulingReleaseContent,
  type SchedulingReleaseCopy,
  type SchedulingReleaseIntent,
  type SchedulingReleaseIntentKind,
  type SchedulingReleaseSnapshot,
  type SchedulingReleaseState,
  type SchedulingReleaseVisibility,
} from './scheduling-release.model';
import styles from './scheduling-release.module.css';

export interface SchedulingReleaseProps {
  readonly locale: SupportedLocale;
  readonly state: SchedulingReleaseState;
  readonly snapshot: SchedulingReleaseSnapshot;
  readonly copy: SchedulingReleaseCopy;
  readonly content: SchedulingReleaseContent;
  readonly visibility: SchedulingReleaseVisibility;
  readonly onIntent: (intent: SchedulingReleaseIntent) => void;
}

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function SchedulingRelease({
  locale,
  state,
  snapshot,
  copy,
  content,
  visibility,
  onIntent,
}: SchedulingReleaseProps) {
  const viewModel = getSchedulingReleaseViewModel(locale, state, snapshot, visibility);
  const stateMessage = copy.feedback[state];
  const consequenceBody = {
    local: content.localConsequenceBody,
    pending: content.pendingConsequenceBody,
    authoritative_final: content.authoritativeFinalConsequenceBody,
  }[viewModel.consequence];

  function emitIntent(kind: SchedulingReleaseIntentKind) {
    if (!isSchedulingReleaseIntentEnabled(state, kind, snapshot)) return;
    const intent = createSchedulingReleaseIntent(kind, snapshot);
    if (intent !== undefined) onIntent(intent);
  }

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-COA-007"
      data-access-boundary="COACH_PRIVATE"
      data-role-visibility="ROL-004 ROL-007 ROL-012"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="scheduling-release-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame} data-region="context-identity">
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="scheduling-release-title">{copy.title}</h1>
          <p>{content.contextBody}</p>
          <div className={styles.referenceGroup}>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.workspaceReference}
            </bdi>
            <bdi className={styles.reference} dir="ltr">
              {snapshot.subjectScopeReference}
            </bdi>
            {snapshot.traineeScopeReference ? (
              <bdi className={styles.reference} dir="ltr">
                {snapshot.traineeScopeReference}
              </bdi>
            ) : null}
          </div>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.region}
            data-region="authority-lifecycle"
            aria-labelledby="scheduling-release-authority-heading"
          >
            <h2 id="scheduling-release-authority-heading">{copy.authorityHeading}</h2>
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
            data-region="schedule-release-planning"
            aria-labelledby="scheduling-release-plan-heading"
            aria-busy={state === 'loading' || state === 'pending'}
          >
            <h2 id="scheduling-release-plan-heading">{copy.planHeading}</h2>
            <p>{content.planBody}</p>
            {viewModel.showPlan ? (
              <div className={styles.planGrid}>
                <div className={styles.planItem}>
                  <bdi className={styles.reference} dir="ltr">
                    {snapshot.scheduleReleaseIntentReference}
                  </bdi>
                  {snapshot.schedulePreviewReference ? (
                    <bdi className={styles.reference} dir="ltr">
                      {snapshot.schedulePreviewReference}
                    </bdi>
                  ) : null}
                </div>
                <div className={styles.planItem}>
                  <bdi className={styles.reference} dir="ltr">
                    {snapshot.authoritativeCoachingTimeContext}
                  </bdi>
                  <bdi className={styles.reference} dir="ltr">
                    {snapshot.effectiveTimeContext}
                  </bdi>
                </div>
                <div className={styles.planItem}>
                  {snapshot.definitionVersionReferences.map((reference) => (
                    <bdi className={styles.reference} dir="ltr" key={reference}>
                      {reference}
                    </bdi>
                  ))}
                </div>
              </div>
            ) : (
              <p>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="structured-reason"
            aria-labelledby="scheduling-release-reason-heading"
          >
            <h2 id="scheduling-release-reason-heading">{copy.reasonHeading}</h2>
            <strong>{snapshot.reason.categoryLabel}</strong>
            <p>{snapshot.reason.rationale}</p>
          </section>

          <section
            className={styles.region}
            data-region="evidence-audit-context"
            aria-labelledby="scheduling-release-evidence-heading"
          >
            <h2 id="scheduling-release-evidence-heading">{copy.evidenceHeading}</h2>
            <p>{content.evidenceBody}</p>
            <div className={styles.referenceGroup}>
              {snapshot.policyReference ? (
                <bdi className={styles.reference} dir="ltr">
                  {snapshot.policyReference}
                </bdi>
              ) : null}
              {snapshot.evidenceReferences.map((reference) => (
                <bdi className={styles.reference} dir="ltr" key={reference}>
                  {reference}
                </bdi>
              ))}
            </div>
          </section>

          <section
            className={styles.region}
            data-region="outcome-consequence"
            aria-labelledby="scheduling-release-consequence-heading"
          >
            <h2 id="scheduling-release-consequence-heading">{copy.consequenceHeading}</h2>
            <p data-consequence={viewModel.consequence}>{consequenceBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="governed-actions"
            aria-labelledby="scheduling-release-actions-heading"
          >
            <h2 id="scheduling-release-actions-heading">{copy.actionsHeading}</h2>
            <div className={styles.actions}>
              {viewModel.visibleIntents.map((kind) => (
                <button
                  className={
                    kind === 'submit_release_intent' ? styles.primaryAction : styles.secondaryAction
                  }
                  key={kind}
                  type="button"
                  disabled={!isSchedulingReleaseIntentEnabled(state, kind, snapshot)}
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
            aria-labelledby="scheduling-release-feedback-heading"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="scheduling-release-feedback-heading">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
              id="scheduling-release-feedback"
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>

          <aside className={styles.helpRegion} aria-labelledby="scheduling-release-help-heading">
            <h2 id="scheduling-release-help-heading">{copy.helpHeading}</h2>
            <p>{content.helpBody}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
