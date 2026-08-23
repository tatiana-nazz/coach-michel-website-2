import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const incidentIntakeStates = [
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

export type IncidentIntakeState = (typeof incidentIntakeStates)[number];

export const incidentIntakeErrorCodes = [
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

export type IncidentIntakeErrorCode = (typeof incidentIntakeErrorCodes)[number];

export const incidentIntakeIntentKinds = [
  'review_incident_context',
  'review_support_privacy_context',
  'submit_incident_classification',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type IncidentIntakeIntentKind = (typeof incidentIntakeIntentKinds)[number];
export type IncidentIntakeVisibility = Readonly<Record<IncidentIntakeIntentKind, boolean>>;
export type IncidentIntakeFeedbackRole = 'status' | 'alert';
export type IncidentIntakeFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface IncidentIntakeCategory {
  readonly orderingReference: string;
  readonly categoryReference: string;
  readonly label: string;
  readonly description: string;
  readonly consequence: string;
  readonly intakeAvailable: boolean;
}

export interface IncidentIntakeSnapshot {
  readonly workspaceReference: string;
  readonly incidentReferences: readonly string[];
  readonly affectedReferences: readonly string[];
  readonly supportCaseReferences: readonly string[];
  readonly privacyContextReferences: readonly string[];
  readonly evidenceReferences: readonly string[];
  readonly auditReferences: readonly string[];
  readonly dependencyReferences: readonly string[];
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly categories: readonly IncidentIntakeCategory[];
  readonly selectedCategoryReference?: string;
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface IncidentIntakeCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly intakeHeading: string;
  readonly categoryLabel: string;
  readonly categoryPlaceholder: string;
  readonly supportPrivacyHeading: string;
  readonly evidenceHeading: string;
  readonly dependencyHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<IncidentIntakeIntentKind, string>>;
  readonly feedback: Readonly<Record<IncidentIntakeState, string>>;
}

export interface IncidentIntakeContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly intakeBody: string;
  readonly supportPrivacyBody: string;
  readonly evidenceBody: string;
  readonly dependencyBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type IncidentIntakeIntent =
  | Readonly<{
      kind: 'review_incident_context';
      workspaceReference: string;
      incidentReferences: readonly string[];
      affectedReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'review_support_privacy_context';
      workspaceReference: string;
      supportCaseReferences: readonly string[];
      privacyContextReferences: readonly string[];
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'submit_incident_classification';
      workspaceReference: string;
      categoryReference: string;
      affectedReferences: readonly string[];
      evidenceReferences: readonly string[];
      dependencyReferences: readonly string[];
    }>
  | Readonly<{ kind: 'refresh_context'; workspaceReference: string }>
  | Readonly<{ kind: 'retry'; workspaceReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      workspaceReference: string;
      incidentReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface IncidentIntakeViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: IncidentIntakeState;
  readonly feedbackRole: IncidentIntakeFeedbackRole;
  readonly feedbackTone: IncidentIntakeFeedbackTone;
  readonly showContext: boolean;
  readonly categorySelectionEnabled: boolean;
  readonly visibleIntents: readonly IncidentIntakeIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    workspaceReference: string;
    incidentReferences: readonly string[];
    affectedReferences: readonly string[];
    supportCaseReferences: readonly string[];
    privacyContextReferences: readonly string[];
    evidenceReferences: readonly string[];
    auditReferences: readonly string[];
    dependencyReferences: readonly string[];
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    categoryReferences: readonly string[];
    orderingReferences: readonly string[];
    selectedCategoryReference: string | undefined;
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
  IncidentIntakeState,
  { role: IncidentIntakeFeedbackRole; tone: IncidentIntakeFeedbackTone; show: boolean }
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
} as const satisfies Record<IncidentIntakeErrorCode, IncidentIntakeState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function selectedCategory(snapshot: IncidentIntakeSnapshot): IncidentIntakeCategory | undefined {
  return snapshot.categories.find(
    (category) => category.categoryReference === snapshot.selectedCategoryReference,
  );
}

function isInteractive(state: IncidentIntakeState): boolean {
  return state === 'ready' || state === 'recovery';
}

export function mapIncidentIntakeErrorCode(code: IncidentIntakeErrorCode): IncidentIntakeState {
  return stateByErrorCode[code];
}

export function isIncidentIntakeIntentEnabled(
  state: IncidentIntakeState,
  kind: IncidentIntakeIntentKind,
  snapshot: IncidentIntakeSnapshot,
): boolean {
  if (kind === 'review_incident_context') {
    return isInteractive(state) && snapshot.incidentReferences.length > 0;
  }
  if (kind === 'review_support_privacy_context') {
    return (
      isInteractive(state) &&
      (snapshot.supportCaseReferences.length > 0 || snapshot.privacyContextReferences.length > 0)
    );
  }
  if (kind === 'submit_incident_classification') {
    return isInteractive(state) && selectedCategory(snapshot)?.intakeAvailable === true;
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

export function createIncidentIntakeIntent(
  kind: IncidentIntakeIntentKind,
  snapshot: IncidentIntakeSnapshot,
): IncidentIntakeIntent | undefined {
  if (kind === 'review_incident_context' && snapshot.incidentReferences.length > 0) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      incidentReferences: Object.freeze([...snapshot.incidentReferences]),
      affectedReferences: Object.freeze([...snapshot.affectedReferences]),
    });
  }
  if (
    kind === 'review_support_privacy_context' &&
    (snapshot.supportCaseReferences.length > 0 || snapshot.privacyContextReferences.length > 0)
  ) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      supportCaseReferences: Object.freeze([...snapshot.supportCaseReferences]),
      privacyContextReferences: Object.freeze([...snapshot.privacyContextReferences]),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
    });
  }
  const category = selectedCategory(snapshot);
  if (kind === 'submit_incident_classification' && category?.intakeAvailable === true) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      categoryReference: category.categoryReference,
      affectedReferences: Object.freeze([...snapshot.affectedReferences]),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      dependencyReferences: Object.freeze([...snapshot.dependencyReferences]),
    });
  }
  if (kind === 'refresh_context') {
    return Object.freeze({ kind, workspaceReference: snapshot.workspaceReference });
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
      incidentReferences: Object.freeze([...snapshot.incidentReferences]),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getIncidentIntakeViewModel(
  locale: SupportedLocale,
  state: IncidentIntakeState,
  snapshot: IncidentIntakeSnapshot,
  visibility: IncidentIntakeVisibility,
): IncidentIntakeViewModel {
  const presentation = statePresentation[state];
  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.role,
    feedbackTone: presentation.tone,
    showContext:
      presentation.show &&
      (snapshot.incidentReferences.length > 0 ||
        snapshot.affectedReferences.length > 0 ||
        snapshot.categories.length > 0),
    categorySelectionEnabled:
      state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(incidentIntakeIntentKinds.filter((kind) => visibility[kind])),
    consequence:
      state === 'authoritative_final'
        ? 'authoritative_final'
        : state === 'pending'
          ? 'pending'
          : 'local',
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      workspaceReference: snapshot.workspaceReference,
      incidentReferences: Object.freeze([...snapshot.incidentReferences]),
      affectedReferences: Object.freeze([...snapshot.affectedReferences]),
      supportCaseReferences: Object.freeze([...snapshot.supportCaseReferences]),
      privacyContextReferences: Object.freeze([...snapshot.privacyContextReferences]),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      auditReferences: Object.freeze([...snapshot.auditReferences]),
      dependencyReferences: Object.freeze([...snapshot.dependencyReferences]),
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      categoryReferences: Object.freeze(
        snapshot.categories.map((category) => category.categoryReference),
      ),
      orderingReferences: Object.freeze(
        snapshot.categories.map((category) => category.orderingReference),
      ),
      selectedCategoryReference: snapshot.selectedCategoryReference,
    }),
  };
}
