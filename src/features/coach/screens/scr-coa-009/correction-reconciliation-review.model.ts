import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const correctionReconciliationReviewStates = [
  'loading',
  'ready',
  'empty',
  'validation_error',
  'authentication_required',
  'authority_denied',
  'resource_not_found',
  'resource_not_found_or_unavailable',
  'dependency_unavailable',
  'rate_limited',
  'stale_or_conflicting_state',
  'lifecycle_conflict',
  'duplicate_or_already_applied',
  'pending',
  'recovery',
  'authoritative_final',
] as const;

export type CorrectionReconciliationReviewState =
  (typeof correctionReconciliationReviewStates)[number];

export const correctionReconciliationReviewErrorCodes = [
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'DUPLICATE_OR_ALREADY_APPLIED',
  'LIFECYCLE_CONFLICT',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
  'VALIDATION_FAILED',
] as const;

export type CorrectionReconciliationReviewErrorCode =
  (typeof correctionReconciliationReviewErrorCodes)[number];

export const correctionReconciliationReviewIntentKinds = [
  'review_case',
  'prepare_proposal_intent',
  'prepare_decision_intent',
  'review_audit_context',
  'retry',
  'reconcile',
] as const;

export type CorrectionReconciliationReviewIntentKind =
  (typeof correctionReconciliationReviewIntentKinds)[number];
export type CorrectionReconciliationReviewVisibility = Readonly<
  Record<CorrectionReconciliationReviewIntentKind, boolean>
>;
export type CorrectionReconciliationReviewFeedbackRole = 'status' | 'alert';
export type CorrectionReconciliationReviewFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface CorrectionReconciliationCase {
  readonly orderingReference: string;
  readonly caseReference: string;
  readonly proposalReference?: string;
  readonly affectedSubjectReferences: readonly string[];
  readonly scheduleReferences: readonly string[];
  readonly evidenceReferences: readonly string[];
  readonly reasonCategoryLabel: string;
  readonly reasonVersionReference?: string;
  readonly decisionReference?: string;
  readonly separationExceptionEvidenceReferences: readonly string[];
  readonly incidentRecoveryReferences: readonly string[];
  readonly auditReferences: readonly string[];
  readonly displayLabel: string;
  readonly statusLabel: string;
  readonly proposalStatusLabel: string;
  readonly decisionStatusLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
  readonly proposalIntentAvailable: boolean;
  readonly decisionIntentAvailable: boolean;
  readonly auditReviewAvailable: boolean;
}

export interface CorrectionReconciliationReviewSnapshot {
  readonly reviewReference: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly boundedAuditTimeContext?: string;
  readonly continuationContext?: string;
  readonly cases: readonly CorrectionReconciliationCase[];
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface CorrectionReconciliationReviewCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly casesHeading: string;
  readonly evidenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<CorrectionReconciliationReviewIntentKind, string>>;
  readonly feedback: Readonly<Record<CorrectionReconciliationReviewState, string>>;
}

export interface CorrectionReconciliationReviewContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly casesBody: string;
  readonly evidenceBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

interface CaseIntentBase {
  readonly reviewReference: string;
  readonly caseReference: string;
}

export type CorrectionReconciliationReviewIntent =
  | (Readonly<CaseIntentBase> & Readonly<{ kind: 'review_case' }>)
  | (Readonly<CaseIntentBase> &
      Readonly<{
        kind: 'prepare_proposal_intent';
        proposalReference?: string;
        affectedSubjectReferences: readonly string[];
        scheduleReferences: readonly string[];
        evidenceReferences: readonly string[];
        reasonVersionReference?: string;
      }>)
  | (Readonly<CaseIntentBase> &
      Readonly<{
        kind: 'prepare_decision_intent';
        proposalReference?: string;
        decisionReference?: string;
        separationExceptionEvidenceReferences: readonly string[];
      }>)
  | (Readonly<CaseIntentBase> &
      Readonly<{
        kind: 'review_audit_context';
        auditReferences: readonly string[];
        boundedAuditTimeContext?: string;
        continuationContext?: string;
      }>)
  | Readonly<{ kind: 'retry'; reviewReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      reviewReference: string;
      caseReferences: readonly string[];
      evidenceReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface CorrectionReconciliationReviewViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: CorrectionReconciliationReviewState;
  readonly feedbackRole: CorrectionReconciliationReviewFeedbackRole;
  readonly feedbackTone: CorrectionReconciliationReviewFeedbackTone;
  readonly showCases: boolean;
  readonly visibleIntents: readonly CorrectionReconciliationReviewIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    reviewReference: string;
    caseReferences: readonly string[];
    proposalReferences: readonly string[];
    affectedSubjectReferences: readonly string[];
    scheduleReferences: readonly string[];
    evidenceReferences: readonly string[];
    reasonVersionReferences: readonly string[];
    decisionReferences: readonly string[];
    separationExceptionEvidenceReferences: readonly string[];
    incidentRecoveryReferences: readonly string[];
    auditReferences: readonly string[];
    orderingReferences: readonly string[];
    continuationContext: string | undefined;
  }>;
}

const statePresentation = {
  loading: { role: 'status', tone: 'info', show: false },
  ready: { role: 'status', tone: 'info', show: true },
  empty: { role: 'status', tone: 'info', show: false },
  validation_error: { role: 'alert', tone: 'danger', show: true },
  authentication_required: { role: 'alert', tone: 'danger', show: false },
  authority_denied: { role: 'alert', tone: 'danger', show: false },
  resource_not_found: { role: 'alert', tone: 'warning', show: false },
  resource_not_found_or_unavailable: { role: 'alert', tone: 'warning', show: false },
  dependency_unavailable: { role: 'alert', tone: 'warning', show: false },
  rate_limited: { role: 'alert', tone: 'warning', show: false },
  stale_or_conflicting_state: { role: 'alert', tone: 'warning', show: true },
  lifecycle_conflict: { role: 'alert', tone: 'warning', show: true },
  duplicate_or_already_applied: { role: 'alert', tone: 'warning', show: true },
  pending: { role: 'status', tone: 'info', show: true },
  recovery: { role: 'status', tone: 'info', show: true },
  authoritative_final: { role: 'status', tone: 'success', show: true },
} as const satisfies Record<
  CorrectionReconciliationReviewState,
  {
    role: CorrectionReconciliationReviewFeedbackRole;
    tone: CorrectionReconciliationReviewFeedbackTone;
    show: boolean;
  }
>;

const stateByErrorCode = {
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  DUPLICATE_OR_ALREADY_APPLIED: 'duplicate_or_already_applied',
  LIFECYCLE_CONFLICT: 'lifecycle_conflict',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
  VALIDATION_FAILED: 'validation_error',
} as const satisfies Record<
  CorrectionReconciliationReviewErrorCode,
  CorrectionReconciliationReviewState
>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function allEvidence(snapshot: CorrectionReconciliationReviewSnapshot): readonly string[] {
  return Object.freeze(
    snapshot.cases.flatMap((item) => [
      ...item.evidenceReferences,
      ...item.separationExceptionEvidenceReferences,
      ...item.incidentRecoveryReferences,
    ]),
  );
}

export function mapCorrectionReconciliationReviewErrorCode(
  code: CorrectionReconciliationReviewErrorCode,
): CorrectionReconciliationReviewState {
  return stateByErrorCode[code];
}

export function isCorrectionReconciliationReviewIntentEnabled(
  state: CorrectionReconciliationReviewState,
  kind: CorrectionReconciliationReviewIntentKind,
  snapshot: CorrectionReconciliationReviewSnapshot,
  item?: CorrectionReconciliationCase,
): boolean {
  const interactive = state === 'ready' || state === 'recovery';
  if (kind === 'review_case') return interactive && item?.reviewAvailable === true;
  if (kind === 'prepare_proposal_intent') {
    return interactive && item?.proposalIntentAvailable === true;
  }
  if (kind === 'prepare_decision_intent') {
    return interactive && item?.decisionIntentAvailable === true;
  }
  if (kind === 'review_audit_context') {
    return (
      (interactive || state === 'authoritative_final') &&
      item?.auditReviewAvailable === true &&
      item.auditReferences.length > 0
    );
  }
  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      hasValue(snapshot.retryContext)
    );
  }
  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'lifecycle_conflict' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    snapshot.cases.length > 0 &&
    hasValue(snapshot.reconciliationContext)
  );
}

export function createCorrectionReconciliationReviewIntent(
  kind: CorrectionReconciliationReviewIntentKind,
  snapshot: CorrectionReconciliationReviewSnapshot,
  item?: CorrectionReconciliationCase,
): CorrectionReconciliationReviewIntent | undefined {
  const base =
    item === undefined
      ? undefined
      : { reviewReference: snapshot.reviewReference, caseReference: item.caseReference };
  if (kind === 'review_case' && base !== undefined && item?.reviewAvailable === true) {
    return Object.freeze({ kind, ...base });
  }
  if (
    kind === 'prepare_proposal_intent' &&
    base !== undefined &&
    item?.proposalIntentAvailable === true
  ) {
    return Object.freeze({
      kind,
      ...base,
      ...(item.proposalReference === undefined
        ? {}
        : { proposalReference: item.proposalReference }),
      affectedSubjectReferences: Object.freeze([...item.affectedSubjectReferences]),
      scheduleReferences: Object.freeze([...item.scheduleReferences]),
      evidenceReferences: Object.freeze([...item.evidenceReferences]),
      ...(item.reasonVersionReference === undefined
        ? {}
        : { reasonVersionReference: item.reasonVersionReference }),
    });
  }
  if (
    kind === 'prepare_decision_intent' &&
    base !== undefined &&
    item?.decisionIntentAvailable === true
  ) {
    return Object.freeze({
      kind,
      ...base,
      ...(item.proposalReference === undefined
        ? {}
        : { proposalReference: item.proposalReference }),
      ...(item.decisionReference === undefined
        ? {}
        : { decisionReference: item.decisionReference }),
      separationExceptionEvidenceReferences: Object.freeze([
        ...item.separationExceptionEvidenceReferences,
      ]),
    });
  }
  if (
    kind === 'review_audit_context' &&
    base !== undefined &&
    item?.auditReviewAvailable === true &&
    item.auditReferences.length > 0
  ) {
    return Object.freeze({
      kind,
      ...base,
      auditReferences: Object.freeze([...item.auditReferences]),
      ...(snapshot.boundedAuditTimeContext === undefined
        ? {}
        : { boundedAuditTimeContext: snapshot.boundedAuditTimeContext }),
      ...(snapshot.continuationContext === undefined
        ? {}
        : { continuationContext: snapshot.continuationContext }),
    });
  }
  if (kind === 'retry' && hasValue(snapshot.retryContext)) {
    return Object.freeze({
      kind,
      reviewReference: snapshot.reviewReference,
      retryContext: snapshot.retryContext,
    });
  }
  if (kind === 'reconcile' && hasValue(snapshot.reconciliationContext)) {
    return Object.freeze({
      kind,
      reviewReference: snapshot.reviewReference,
      caseReferences: Object.freeze(snapshot.cases.map((entry) => entry.caseReference)),
      evidenceReferences: allEvidence(snapshot),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getCorrectionReconciliationReviewViewModel(
  locale: SupportedLocale,
  state: CorrectionReconciliationReviewState,
  snapshot: CorrectionReconciliationReviewSnapshot,
  visibility: CorrectionReconciliationReviewVisibility,
): CorrectionReconciliationReviewViewModel {
  const presentation = statePresentation[state];
  const consequence =
    state === 'authoritative_final'
      ? 'authoritative_final'
      : state === 'pending'
        ? 'pending'
        : 'local';
  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.role,
    feedbackTone: presentation.tone,
    showCases: presentation.show && snapshot.cases.length > 0,
    visibleIntents: Object.freeze(
      correctionReconciliationReviewIntentKinds.filter((kind) => visibility[kind]),
    ),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      reviewReference: snapshot.reviewReference,
      caseReferences: Object.freeze(snapshot.cases.map((item) => item.caseReference)),
      proposalReferences: Object.freeze(
        snapshot.cases.flatMap((item) =>
          item.proposalReference === undefined ? [] : [item.proposalReference],
        ),
      ),
      affectedSubjectReferences: Object.freeze(
        snapshot.cases.flatMap((item) => [...item.affectedSubjectReferences]),
      ),
      scheduleReferences: Object.freeze(
        snapshot.cases.flatMap((item) => [...item.scheduleReferences]),
      ),
      evidenceReferences: Object.freeze(
        snapshot.cases.flatMap((item) => [...item.evidenceReferences]),
      ),
      reasonVersionReferences: Object.freeze(
        snapshot.cases.flatMap((item) =>
          item.reasonVersionReference === undefined ? [] : [item.reasonVersionReference],
        ),
      ),
      decisionReferences: Object.freeze(
        snapshot.cases.flatMap((item) =>
          item.decisionReference === undefined ? [] : [item.decisionReference],
        ),
      ),
      separationExceptionEvidenceReferences: Object.freeze(
        snapshot.cases.flatMap((item) => [...item.separationExceptionEvidenceReferences]),
      ),
      incidentRecoveryReferences: Object.freeze(
        snapshot.cases.flatMap((item) => [...item.incidentRecoveryReferences]),
      ),
      auditReferences: Object.freeze(snapshot.cases.flatMap((item) => [...item.auditReferences])),
      orderingReferences: Object.freeze(snapshot.cases.map((item) => item.orderingReference)),
      continuationContext: snapshot.continuationContext,
    }),
  };
}
