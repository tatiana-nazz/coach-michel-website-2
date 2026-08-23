import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const stateReconciliationHandoffStates = [
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

export type StateReconciliationHandoffState = (typeof stateReconciliationHandoffStates)[number];

export const stateReconciliationHandoffErrorCodes = [
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

export type StateReconciliationHandoffErrorCode =
  (typeof stateReconciliationHandoffErrorCodes)[number];

export const stateReconciliationHandoffIntentKinds = [
  'review_validation_context',
  'submit_reconciliation_handoff',
  'refresh_derived_status',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type StateReconciliationHandoffIntentKind =
  (typeof stateReconciliationHandoffIntentKinds)[number];
export type StateReconciliationHandoffVisibility = Readonly<
  Record<StateReconciliationHandoffIntentKind, boolean>
>;
export type StateReconciliationHandoffFeedbackRole = 'status' | 'alert';
export type StateReconciliationHandoffFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface StateReconciliationHandoffOption {
  readonly orderingReference: string;
  readonly optionReference: string;
  readonly targetHandoffCategoryReference: string;
  readonly structuredReasonReference: string;
  readonly label: string;
  readonly description: string;
  readonly consequence: string;
  readonly handoffAvailable: boolean;
}

export interface StateReconciliationHandoffSnapshot {
  readonly workspaceReference: string;
  readonly validationReference: string;
  readonly handoffReferences: readonly string[];
  readonly affectedSubjectReferences: readonly string[];
  readonly affectedScheduleReferences: readonly string[];
  readonly evidenceReferences: readonly string[];
  readonly auditReferences: readonly string[];
  readonly derivedStatusReferences: readonly string[];
  readonly reconciliationReferences: readonly string[];
  readonly dependencyReferences: readonly string[];
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly handoffOptions: readonly StateReconciliationHandoffOption[];
  readonly selectedHandoffOptionReference?: string;
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface StateReconciliationHandoffCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly validationHeading: string;
  readonly handoffHeading: string;
  readonly handoffLabel: string;
  readonly handoffPlaceholder: string;
  readonly affectedContextHeading: string;
  readonly evidenceHeading: string;
  readonly reconciliationHeading: string;
  readonly dependencyHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<StateReconciliationHandoffIntentKind, string>>;
  readonly feedback: Readonly<Record<StateReconciliationHandoffState, string>>;
}

export interface StateReconciliationHandoffContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly validationBody: string;
  readonly handoffBody: string;
  readonly affectedContextBody: string;
  readonly evidenceBody: string;
  readonly reconciliationBody: string;
  readonly dependencyBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type StateReconciliationHandoffIntent =
  | Readonly<{
      kind: 'review_validation_context';
      workspaceReference: string;
      validationReference: string;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'submit_reconciliation_handoff';
      workspaceReference: string;
      validationReference: string;
      targetHandoffCategoryReference: string;
      affectedSubjectReferences: readonly string[];
      affectedScheduleReferences: readonly string[];
      structuredReasonReference: string;
    }>
  | Readonly<{
      kind: 'refresh_derived_status';
      workspaceReference: string;
      validationReference: string;
      affectedSubjectReferences: readonly string[];
      affectedScheduleReferences: readonly string[];
      sourceEvidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'refresh_context';
      workspaceReference: string;
      validationReference: string;
    }>
  | Readonly<{ kind: 'retry'; workspaceReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      workspaceReference: string;
      handoffReferences: readonly string[];
      reconciliationReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface StateReconciliationHandoffViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: StateReconciliationHandoffState;
  readonly feedbackRole: StateReconciliationHandoffFeedbackRole;
  readonly feedbackTone: StateReconciliationHandoffFeedbackTone;
  readonly showContext: boolean;
  readonly handoffSelectionEnabled: boolean;
  readonly visibleIntents: readonly StateReconciliationHandoffIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    workspaceReference: string;
    validationReference: string;
    handoffReferences: readonly string[];
    affectedSubjectReferences: readonly string[];
    affectedScheduleReferences: readonly string[];
    evidenceReferences: readonly string[];
    auditReferences: readonly string[];
    derivedStatusReferences: readonly string[];
    reconciliationReferences: readonly string[];
    dependencyReferences: readonly string[];
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    handoffOptionReferences: readonly string[];
    targetHandoffCategoryReferences: readonly string[];
    structuredReasonReferences: readonly string[];
    orderingReferences: readonly string[];
    selectedHandoffOptionReference: string | undefined;
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
  StateReconciliationHandoffState,
  {
    role: StateReconciliationHandoffFeedbackRole;
    tone: StateReconciliationHandoffFeedbackTone;
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
} as const satisfies Record<StateReconciliationHandoffErrorCode, StateReconciliationHandoffState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function selectedHandoff(
  snapshot: StateReconciliationHandoffSnapshot,
): StateReconciliationHandoffOption | undefined {
  return snapshot.handoffOptions.find(
    (option) => option.optionReference === snapshot.selectedHandoffOptionReference,
  );
}

function isInteractive(state: StateReconciliationHandoffState): boolean {
  return state === 'ready' || state === 'recovery';
}

export function mapStateReconciliationHandoffErrorCode(
  code: StateReconciliationHandoffErrorCode,
): StateReconciliationHandoffState {
  return stateByErrorCode[code];
}

export function isStateReconciliationHandoffIntentEnabled(
  state: StateReconciliationHandoffState,
  kind: StateReconciliationHandoffIntentKind,
  snapshot: StateReconciliationHandoffSnapshot,
): boolean {
  if (kind === 'review_validation_context') {
    return isInteractive(state) && snapshot.validationReference.length > 0;
  }
  if (kind === 'submit_reconciliation_handoff') {
    return isInteractive(state) && selectedHandoff(snapshot)?.handoffAvailable === true;
  }
  if (kind === 'refresh_derived_status') {
    return (
      (state === 'ready' ||
        state === 'empty' ||
        state === 'recovery' ||
        state === 'sync_or_reconciliation_required') &&
      (snapshot.affectedSubjectReferences.length > 0 ||
        snapshot.affectedScheduleReferences.length > 0)
    );
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

export function createStateReconciliationHandoffIntent(
  kind: StateReconciliationHandoffIntentKind,
  snapshot: StateReconciliationHandoffSnapshot,
): StateReconciliationHandoffIntent | undefined {
  if (kind === 'review_validation_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      validationReference: snapshot.validationReference,
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
    });
  }
  const handoff = selectedHandoff(snapshot);
  if (kind === 'submit_reconciliation_handoff' && handoff?.handoffAvailable === true) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      validationReference: snapshot.validationReference,
      targetHandoffCategoryReference: handoff.targetHandoffCategoryReference,
      affectedSubjectReferences: Object.freeze([...snapshot.affectedSubjectReferences]),
      affectedScheduleReferences: Object.freeze([...snapshot.affectedScheduleReferences]),
      structuredReasonReference: handoff.structuredReasonReference,
    });
  }
  if (
    kind === 'refresh_derived_status' &&
    (snapshot.affectedSubjectReferences.length > 0 ||
      snapshot.affectedScheduleReferences.length > 0)
  ) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      validationReference: snapshot.validationReference,
      affectedSubjectReferences: Object.freeze([...snapshot.affectedSubjectReferences]),
      affectedScheduleReferences: Object.freeze([...snapshot.affectedScheduleReferences]),
      sourceEvidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
    });
  }
  if (kind === 'refresh_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      validationReference: snapshot.validationReference,
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
      handoffReferences: Object.freeze([...snapshot.handoffReferences]),
      reconciliationReferences: Object.freeze([...snapshot.reconciliationReferences]),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getStateReconciliationHandoffViewModel(
  locale: SupportedLocale,
  state: StateReconciliationHandoffState,
  snapshot: StateReconciliationHandoffSnapshot,
  visibility: StateReconciliationHandoffVisibility,
): StateReconciliationHandoffViewModel {
  const presentation = statePresentation[state];
  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.role,
    feedbackTone: presentation.tone,
    showContext:
      presentation.show &&
      (snapshot.handoffReferences.length > 0 ||
        snapshot.affectedSubjectReferences.length > 0 ||
        snapshot.affectedScheduleReferences.length > 0 ||
        snapshot.handoffOptions.length > 0),
    handoffSelectionEnabled:
      state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(
      stateReconciliationHandoffIntentKinds.filter((kind) => visibility[kind]),
    ),
    consequence:
      state === 'authoritative_final'
        ? 'authoritative_final'
        : state === 'pending'
          ? 'pending'
          : 'local',
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      workspaceReference: snapshot.workspaceReference,
      validationReference: snapshot.validationReference,
      handoffReferences: Object.freeze([...snapshot.handoffReferences]),
      affectedSubjectReferences: Object.freeze([...snapshot.affectedSubjectReferences]),
      affectedScheduleReferences: Object.freeze([...snapshot.affectedScheduleReferences]),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      auditReferences: Object.freeze([...snapshot.auditReferences]),
      derivedStatusReferences: Object.freeze([...snapshot.derivedStatusReferences]),
      reconciliationReferences: Object.freeze([...snapshot.reconciliationReferences]),
      dependencyReferences: Object.freeze([...snapshot.dependencyReferences]),
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      handoffOptionReferences: Object.freeze(
        snapshot.handoffOptions.map((option) => option.optionReference),
      ),
      targetHandoffCategoryReferences: Object.freeze(
        snapshot.handoffOptions.map((option) => option.targetHandoffCategoryReference),
      ),
      structuredReasonReferences: Object.freeze(
        snapshot.handoffOptions.map((option) => option.structuredReasonReference),
      ),
      orderingReferences: Object.freeze(
        snapshot.handoffOptions.map((option) => option.orderingReference),
      ),
      selectedHandoffOptionReference: snapshot.selectedHandoffOptionReference,
    }),
  };
}
