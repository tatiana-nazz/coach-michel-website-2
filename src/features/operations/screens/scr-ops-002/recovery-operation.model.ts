import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const recoveryOperationStates = [
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

export type RecoveryOperationState = (typeof recoveryOperationStates)[number];

export const recoveryOperationErrorCodes = [
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

export type RecoveryOperationErrorCode = (typeof recoveryOperationErrorCodes)[number];

export const recoveryOperationIntentKinds = [
  'review_incident_recovery_context',
  'review_governed_command_context',
  'submit_recovery_activity',
  'external_handoff',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type RecoveryOperationIntentKind = (typeof recoveryOperationIntentKinds)[number];
export type RecoveryOperationVisibility = Readonly<Record<RecoveryOperationIntentKind, boolean>>;
export type RecoveryOperationFeedbackRole = 'status' | 'alert';
export type RecoveryOperationFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface RecoveryActivityOption {
  readonly orderingReference: string;
  readonly optionReference: string;
  readonly activityCategoryReference: string;
  readonly governedStatusReference: string;
  readonly structuredReasonReference: string;
  readonly evidenceToolReferences: readonly string[];
  readonly label: string;
  readonly description: string;
  readonly consequence: string;
  readonly intentAvailable: boolean;
}

export interface RecoveryOperationSnapshot {
  readonly workspaceReference: string;
  readonly incidentReference: string;
  readonly recoveryActivityReferences: readonly string[];
  readonly governedCommandReferences: readonly string[];
  readonly evidenceReferences: readonly string[];
  readonly auditReferences: readonly string[];
  readonly dependencyReferences: readonly string[];
  readonly externalHandoffCorrelationReferences: readonly string[];
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly activityOptions: readonly RecoveryActivityOption[];
  readonly selectedActivityOptionReference?: string;
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface RecoveryOperationCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly activityHeading: string;
  readonly activityLabel: string;
  readonly activityPlaceholder: string;
  readonly commandHeading: string;
  readonly evidenceHeading: string;
  readonly dependencyHeading: string;
  readonly handoffHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<RecoveryOperationIntentKind, string>>;
  readonly feedback: Readonly<Record<RecoveryOperationState, string>>;
}

export interface RecoveryOperationContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly activityBody: string;
  readonly commandBody: string;
  readonly evidenceBody: string;
  readonly dependencyBody: string;
  readonly handoffBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type RecoveryOperationIntent =
  | Readonly<{
      kind: 'review_incident_recovery_context';
      workspaceReference: string;
      incidentReference: string;
      recoveryActivityReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'review_governed_command_context';
      workspaceReference: string;
      governedCommandReferences: readonly string[];
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'submit_recovery_activity';
      workspaceReference: string;
      incidentReference: string;
      activityCategoryReference: string;
      governedStatusReference: string;
      structuredReasonReference: string;
      evidenceToolReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'external_handoff';
      workspaceReference: string;
      incidentReference: string;
      correlationReferences: readonly string[];
    }>
  | Readonly<{ kind: 'refresh_context'; workspaceReference: string; incidentReference: string }>
  | Readonly<{ kind: 'retry'; workspaceReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      workspaceReference: string;
      recoveryActivityReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface RecoveryOperationViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: RecoveryOperationState;
  readonly feedbackRole: RecoveryOperationFeedbackRole;
  readonly feedbackTone: RecoveryOperationFeedbackTone;
  readonly showContext: boolean;
  readonly activitySelectionEnabled: boolean;
  readonly visibleIntents: readonly RecoveryOperationIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    workspaceReference: string;
    incidentReference: string;
    recoveryActivityReferences: readonly string[];
    governedCommandReferences: readonly string[];
    evidenceReferences: readonly string[];
    auditReferences: readonly string[];
    dependencyReferences: readonly string[];
    externalHandoffCorrelationReferences: readonly string[];
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    activityOptionReferences: readonly string[];
    activityCategoryReferences: readonly string[];
    governedStatusReferences: readonly string[];
    structuredReasonReferences: readonly string[];
    orderingReferences: readonly string[];
    selectedActivityOptionReference: string | undefined;
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
  RecoveryOperationState,
  { role: RecoveryOperationFeedbackRole; tone: RecoveryOperationFeedbackTone; show: boolean }
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
} as const satisfies Record<RecoveryOperationErrorCode, RecoveryOperationState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function selectedActivity(snapshot: RecoveryOperationSnapshot): RecoveryActivityOption | undefined {
  return snapshot.activityOptions.find(
    (option) => option.optionReference === snapshot.selectedActivityOptionReference,
  );
}

function isInteractive(state: RecoveryOperationState): boolean {
  return state === 'ready' || state === 'recovery';
}

export function mapRecoveryOperationErrorCode(
  code: RecoveryOperationErrorCode,
): RecoveryOperationState {
  return stateByErrorCode[code];
}

export function isRecoveryOperationIntentEnabled(
  state: RecoveryOperationState,
  kind: RecoveryOperationIntentKind,
  snapshot: RecoveryOperationSnapshot,
): boolean {
  if (kind === 'review_incident_recovery_context') {
    return isInteractive(state) && snapshot.incidentReference.length > 0;
  }
  if (kind === 'review_governed_command_context') {
    return isInteractive(state) && snapshot.governedCommandReferences.length > 0;
  }
  if (kind === 'submit_recovery_activity') {
    return isInteractive(state) && selectedActivity(snapshot)?.intentAvailable === true;
  }
  if (kind === 'external_handoff') {
    return isInteractive(state) && snapshot.externalHandoffCorrelationReferences.length > 0;
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

export function createRecoveryOperationIntent(
  kind: RecoveryOperationIntentKind,
  snapshot: RecoveryOperationSnapshot,
): RecoveryOperationIntent | undefined {
  if (kind === 'review_incident_recovery_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      incidentReference: snapshot.incidentReference,
      recoveryActivityReferences: Object.freeze([...snapshot.recoveryActivityReferences]),
    });
  }
  if (kind === 'review_governed_command_context' && snapshot.governedCommandReferences.length > 0) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      governedCommandReferences: Object.freeze([...snapshot.governedCommandReferences]),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
    });
  }
  const activity = selectedActivity(snapshot);
  if (kind === 'submit_recovery_activity' && activity?.intentAvailable === true) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      incidentReference: snapshot.incidentReference,
      activityCategoryReference: activity.activityCategoryReference,
      governedStatusReference: activity.governedStatusReference,
      structuredReasonReference: activity.structuredReasonReference,
      evidenceToolReferences: Object.freeze([...activity.evidenceToolReferences]),
    });
  }
  if (kind === 'external_handoff' && snapshot.externalHandoffCorrelationReferences.length > 0) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      incidentReference: snapshot.incidentReference,
      correlationReferences: Object.freeze([...snapshot.externalHandoffCorrelationReferences]),
    });
  }
  if (kind === 'refresh_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      incidentReference: snapshot.incidentReference,
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
      recoveryActivityReferences: Object.freeze([...snapshot.recoveryActivityReferences]),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getRecoveryOperationViewModel(
  locale: SupportedLocale,
  state: RecoveryOperationState,
  snapshot: RecoveryOperationSnapshot,
  visibility: RecoveryOperationVisibility,
): RecoveryOperationViewModel {
  const presentation = statePresentation[state];
  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.role,
    feedbackTone: presentation.tone,
    showContext:
      presentation.show &&
      (snapshot.recoveryActivityReferences.length > 0 ||
        snapshot.governedCommandReferences.length > 0 ||
        snapshot.activityOptions.length > 0),
    activitySelectionEnabled:
      state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(recoveryOperationIntentKinds.filter((kind) => visibility[kind])),
    consequence:
      state === 'authoritative_final'
        ? 'authoritative_final'
        : state === 'pending'
          ? 'pending'
          : 'local',
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      workspaceReference: snapshot.workspaceReference,
      incidentReference: snapshot.incidentReference,
      recoveryActivityReferences: Object.freeze([...snapshot.recoveryActivityReferences]),
      governedCommandReferences: Object.freeze([...snapshot.governedCommandReferences]),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      auditReferences: Object.freeze([...snapshot.auditReferences]),
      dependencyReferences: Object.freeze([...snapshot.dependencyReferences]),
      externalHandoffCorrelationReferences: Object.freeze([
        ...snapshot.externalHandoffCorrelationReferences,
      ]),
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      activityOptionReferences: Object.freeze(
        snapshot.activityOptions.map((option) => option.optionReference),
      ),
      activityCategoryReferences: Object.freeze(
        snapshot.activityOptions.map((option) => option.activityCategoryReference),
      ),
      governedStatusReferences: Object.freeze(
        snapshot.activityOptions.map((option) => option.governedStatusReference),
      ),
      structuredReasonReferences: Object.freeze(
        snapshot.activityOptions.map((option) => option.structuredReasonReference),
      ),
      orderingReferences: Object.freeze(
        snapshot.activityOptions.map((option) => option.orderingReference),
      ),
      selectedActivityOptionReference: snapshot.selectedActivityOptionReference,
    }),
  };
}
