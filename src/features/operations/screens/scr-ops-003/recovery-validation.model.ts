import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const recoveryValidationStates = [
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
  'offline_or_connectivity_unavailable',
  'sync_or_reconciliation_required',
  'authoritative_final',
] as const;

export type RecoveryValidationState = (typeof recoveryValidationStates)[number];

export const recoveryValidationErrorCodes = [
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

export type RecoveryValidationErrorCode = (typeof recoveryValidationErrorCodes)[number];

export const recoveryValidationIntentKinds = [
  'review_recovery_activity_context',
  'review_objective',
  'submit_validation',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type RecoveryValidationIntentKind = (typeof recoveryValidationIntentKinds)[number];
export type RecoveryValidationVisibility = Readonly<Record<RecoveryValidationIntentKind, boolean>>;
export type RecoveryValidationFeedbackRole = 'status' | 'alert';
export type RecoveryValidationFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface RecoveryValidationObjective {
  readonly orderingReference: string;
  readonly objectiveReference: string;
  readonly priorConfirmationEvidenceReferences: readonly string[];
  readonly heading: string;
  readonly statusLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
}

export interface RecoveryValidationDecision {
  readonly orderingReference: string;
  readonly optionReference: string;
  readonly decisionCategoryReference: string;
  readonly structuredReasonReference: string;
  readonly independenceExceptionEvidenceReferences: readonly string[];
  readonly label: string;
  readonly description: string;
  readonly consequence: string;
  readonly submitAvailable: boolean;
}

export interface RecoveryValidationSnapshot {
  readonly workspaceReference: string;
  readonly recoveryActivityReference: string;
  readonly validationReferences: readonly string[];
  readonly objectives: readonly RecoveryValidationObjective[];
  readonly evidenceReferences: readonly string[];
  readonly auditReferences: readonly string[];
  readonly dependencyReferences: readonly string[];
  readonly validatorStatusReference: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly decisions: readonly RecoveryValidationDecision[];
  readonly selectedDecisionOptionReference?: string;
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface RecoveryValidationCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly activityHeading: string;
  readonly objectivesHeading: string;
  readonly decisionHeading: string;
  readonly decisionLabel: string;
  readonly decisionPlaceholder: string;
  readonly evidenceHeading: string;
  readonly dependencyHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<RecoveryValidationIntentKind, string>>;
  readonly feedback: Readonly<Record<RecoveryValidationState, string>>;
}

export interface RecoveryValidationContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly activityBody: string;
  readonly objectivesBody: string;
  readonly decisionBody: string;
  readonly evidenceBody: string;
  readonly dependencyBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type RecoveryValidationIntent =
  | Readonly<{
      kind: 'review_recovery_activity_context';
      workspaceReference: string;
      recoveryActivityReference: string;
      validationReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'review_objective';
      workspaceReference: string;
      objectiveReference: string;
      priorConfirmationEvidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'submit_validation';
      workspaceReference: string;
      recoveryActivityReference: string;
      decisionCategoryReference: string;
      structuredReasonReference: string;
      recoveryActivityEvidenceReferences: readonly string[];
      independenceExceptionEvidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'refresh_context';
      workspaceReference: string;
      recoveryActivityReference: string;
    }>
  | Readonly<{ kind: 'retry'; workspaceReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      workspaceReference: string;
      validationReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface RecoveryValidationViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: RecoveryValidationState;
  readonly feedbackRole: RecoveryValidationFeedbackRole;
  readonly feedbackTone: RecoveryValidationFeedbackTone;
  readonly showContext: boolean;
  readonly decisionSelectionEnabled: boolean;
  readonly visibleIntents: readonly RecoveryValidationIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    workspaceReference: string;
    recoveryActivityReference: string;
    validationReferences: readonly string[];
    objectiveReferences: readonly string[];
    priorConfirmationEvidenceReferences: readonly string[];
    evidenceReferences: readonly string[];
    auditReferences: readonly string[];
    dependencyReferences: readonly string[];
    validatorStatusReference: string;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    decisionOptionReferences: readonly string[];
    decisionCategoryReferences: readonly string[];
    structuredReasonReferences: readonly string[];
    independenceExceptionEvidenceReferences: readonly string[];
    orderingReferences: readonly string[];
    selectedDecisionOptionReference: string | undefined;
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
  offline_or_connectivity_unavailable: { role: 'alert', tone: 'warning', show: false },
  sync_or_reconciliation_required: { role: 'alert', tone: 'warning', show: true },
  authoritative_final: { role: 'status', tone: 'success', show: true },
} as const satisfies Record<
  RecoveryValidationState,
  { role: RecoveryValidationFeedbackRole; tone: RecoveryValidationFeedbackTone; show: boolean }
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
} as const satisfies Record<RecoveryValidationErrorCode, RecoveryValidationState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function selectedDecision(
  snapshot: RecoveryValidationSnapshot,
): RecoveryValidationDecision | undefined {
  return snapshot.decisions.find(
    (decision) => decision.optionReference === snapshot.selectedDecisionOptionReference,
  );
}

function isInteractive(state: RecoveryValidationState): boolean {
  return state === 'ready' || state === 'recovery';
}

export function mapRecoveryValidationErrorCode(
  code: RecoveryValidationErrorCode,
): RecoveryValidationState {
  return stateByErrorCode[code];
}

export function isRecoveryValidationIntentEnabled(
  state: RecoveryValidationState,
  kind: RecoveryValidationIntentKind,
  snapshot: RecoveryValidationSnapshot,
  objective?: RecoveryValidationObjective,
): boolean {
  if (kind === 'review_recovery_activity_context') {
    return isInteractive(state) && snapshot.recoveryActivityReference.length > 0;
  }
  if (kind === 'review_objective') {
    return isInteractive(state) && objective?.reviewAvailable === true;
  }
  if (kind === 'submit_validation') {
    return isInteractive(state) && selectedDecision(snapshot)?.submitAvailable === true;
  }
  if (kind === 'refresh_context') {
    return (
      state === 'ready' ||
      state === 'empty' ||
      state === 'recovery' ||
      state === 'offline_or_connectivity_unavailable' ||
      state === 'sync_or_reconciliation_required'
    );
  }
  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' ||
        state === 'rate_limited' ||
        state === 'recovery' ||
        state === 'offline_or_connectivity_unavailable') &&
      hasValue(snapshot.retryContext)
    );
  }
  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'lifecycle_conflict' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery' ||
      state === 'sync_or_reconciliation_required') &&
    hasValue(snapshot.reconciliationContext)
  );
}

export function createRecoveryValidationIntent(
  kind: RecoveryValidationIntentKind,
  snapshot: RecoveryValidationSnapshot,
  objective?: RecoveryValidationObjective,
): RecoveryValidationIntent | undefined {
  if (kind === 'review_recovery_activity_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      recoveryActivityReference: snapshot.recoveryActivityReference,
      validationReferences: Object.freeze([...snapshot.validationReferences]),
    });
  }
  if (kind === 'review_objective' && objective?.reviewAvailable === true) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      objectiveReference: objective.objectiveReference,
      priorConfirmationEvidenceReferences: Object.freeze([
        ...objective.priorConfirmationEvidenceReferences,
      ]),
    });
  }
  const decision = selectedDecision(snapshot);
  if (kind === 'submit_validation' && decision?.submitAvailable === true) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      recoveryActivityReference: snapshot.recoveryActivityReference,
      decisionCategoryReference: decision.decisionCategoryReference,
      structuredReasonReference: decision.structuredReasonReference,
      recoveryActivityEvidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      independenceExceptionEvidenceReferences: Object.freeze([
        ...decision.independenceExceptionEvidenceReferences,
      ]),
    });
  }
  if (kind === 'refresh_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      recoveryActivityReference: snapshot.recoveryActivityReference,
    });
  }
  if (kind === 'retry' && hasValue(snapshot.retryContext)) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      retryContext: snapshot.retryContext,
    });
  }
  if (kind === 'reconcile' && hasValue(snapshot.reconciliationContext)) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      validationReferences: Object.freeze([...snapshot.validationReferences]),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getRecoveryValidationViewModel(
  locale: SupportedLocale,
  state: RecoveryValidationState,
  snapshot: RecoveryValidationSnapshot,
  visibility: RecoveryValidationVisibility,
): RecoveryValidationViewModel {
  const presentation = statePresentation[state];
  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.role,
    feedbackTone: presentation.tone,
    showContext:
      presentation.show &&
      (snapshot.validationReferences.length > 0 ||
        snapshot.objectives.length > 0 ||
        snapshot.decisions.length > 0),
    decisionSelectionEnabled:
      state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(recoveryValidationIntentKinds.filter((kind) => visibility[kind])),
    consequence:
      state === 'authoritative_final'
        ? 'authoritative_final'
        : state === 'pending'
          ? 'pending'
          : 'local',
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      workspaceReference: snapshot.workspaceReference,
      recoveryActivityReference: snapshot.recoveryActivityReference,
      validationReferences: Object.freeze([...snapshot.validationReferences]),
      objectiveReferences: Object.freeze(
        snapshot.objectives.map((objective) => objective.objectiveReference),
      ),
      priorConfirmationEvidenceReferences: Object.freeze(
        snapshot.objectives.flatMap((objective) => objective.priorConfirmationEvidenceReferences),
      ),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      auditReferences: Object.freeze([...snapshot.auditReferences]),
      dependencyReferences: Object.freeze([...snapshot.dependencyReferences]),
      validatorStatusReference: snapshot.validatorStatusReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      decisionOptionReferences: Object.freeze(
        snapshot.decisions.map((decision) => decision.optionReference),
      ),
      decisionCategoryReferences: Object.freeze(
        snapshot.decisions.map((decision) => decision.decisionCategoryReference),
      ),
      structuredReasonReferences: Object.freeze(
        snapshot.decisions.map((decision) => decision.structuredReasonReference),
      ),
      independenceExceptionEvidenceReferences: Object.freeze(
        snapshot.decisions.flatMap((decision) => decision.independenceExceptionEvidenceReferences),
      ),
      orderingReferences: Object.freeze([
        ...snapshot.objectives.map((objective) => objective.orderingReference),
        ...snapshot.decisions.map((decision) => decision.orderingReference),
      ]),
      selectedDecisionOptionReference: snapshot.selectedDecisionOptionReference,
    }),
  };
}
