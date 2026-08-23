import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const schedulingReleaseStates = [
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

export type SchedulingReleaseState = (typeof schedulingReleaseStates)[number];

export const schedulingReleaseErrorCodes = [
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

export type SchedulingReleaseErrorCode = (typeof schedulingReleaseErrorCodes)[number];

export const schedulingReleaseIntentKinds = [
  'review_preview',
  'submit_release_intent',
  'review_policy_context',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type SchedulingReleaseIntentKind = (typeof schedulingReleaseIntentKinds)[number];
export type SchedulingReleaseVisibility = Readonly<Record<SchedulingReleaseIntentKind, boolean>>;
export type SchedulingReleaseFeedbackRole = 'status' | 'alert';
export type SchedulingReleaseFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface SchedulingReleaseReason {
  readonly categoryLabel: string;
  readonly rationale: string;
}

export interface SchedulingReleaseSnapshot {
  readonly workspaceReference: string;
  readonly subjectScopeReference: string;
  readonly traineeScopeReference?: string;
  readonly definitionVersionReferences: readonly string[];
  readonly schedulePreviewReference?: string;
  readonly scheduleReleaseIntentReference: string;
  readonly authoritativeCoachingTimeContext: string;
  readonly effectiveTimeContext: string;
  readonly reason: SchedulingReleaseReason;
  readonly policyReference?: string;
  readonly evidenceReferences: readonly string[];
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface SchedulingReleaseCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly planHeading: string;
  readonly reasonHeading: string;
  readonly evidenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<SchedulingReleaseIntentKind, string>>;
  readonly feedback: Readonly<Record<SchedulingReleaseState, string>>;
}

export interface SchedulingReleaseContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly planBody: string;
  readonly evidenceBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type SchedulingReleaseIntent =
  | Readonly<{
      kind: 'review_preview';
      workspaceReference: string;
      schedulePreviewReference: string;
      subjectScopeReference: string;
    }>
  | Readonly<{
      kind: 'submit_release_intent';
      workspaceReference: string;
      subjectScopeReference: string;
      traineeScopeReference?: string;
      definitionVersionReferences: readonly string[];
      scheduleReleaseIntentReference: string;
      authoritativeCoachingTimeContext: string;
      effectiveTimeContext: string;
      reason: SchedulingReleaseReason;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'review_policy_context';
      workspaceReference: string;
      policyReference: string;
    }>
  | Readonly<{
      kind: 'refresh_context';
      workspaceReference: string;
      subjectScopeReference: string;
    }>
  | Readonly<{ kind: 'retry'; workspaceReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      workspaceReference: string;
      evidenceReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface SchedulingReleaseViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: SchedulingReleaseState;
  readonly feedbackRole: SchedulingReleaseFeedbackRole;
  readonly feedbackTone: SchedulingReleaseFeedbackTone;
  readonly showPlan: boolean;
  readonly visibleIntents: readonly SchedulingReleaseIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    workspaceReference: string;
    subjectScopeReference: string;
    traineeScopeReference: string | undefined;
    definitionVersionReferences: readonly string[];
    schedulePreviewReference: string | undefined;
    scheduleReleaseIntentReference: string;
    policyReference: string | undefined;
    evidenceReferences: readonly string[];
    authorityStatusReference: string;
    lifecycleStatusReference: string;
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
  SchedulingReleaseState,
  { role: SchedulingReleaseFeedbackRole; tone: SchedulingReleaseFeedbackTone; show: boolean }
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
} as const satisfies Record<SchedulingReleaseErrorCode, SchedulingReleaseState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

export function mapSchedulingReleaseErrorCode(
  code: SchedulingReleaseErrorCode,
): SchedulingReleaseState {
  return stateByErrorCode[code];
}

export function isSchedulingReleaseIntentEnabled(
  state: SchedulingReleaseState,
  kind: SchedulingReleaseIntentKind,
  snapshot: SchedulingReleaseSnapshot,
): boolean {
  const interactive = state === 'ready' || state === 'recovery';
  if (kind === 'review_preview') return interactive && hasValue(snapshot.schedulePreviewReference);
  if (kind === 'submit_release_intent') {
    return (
      interactive &&
      hasValue(snapshot.subjectScopeReference) &&
      snapshot.definitionVersionReferences.length > 0 &&
      hasValue(snapshot.scheduleReleaseIntentReference) &&
      hasValue(snapshot.authoritativeCoachingTimeContext) &&
      hasValue(snapshot.effectiveTimeContext) &&
      hasValue(snapshot.reason.categoryLabel) &&
      hasValue(snapshot.reason.rationale)
    );
  }
  if (kind === 'review_policy_context') {
    return (interactive || state === 'authoritative_final') && hasValue(snapshot.policyReference);
  }
  if (kind === 'refresh_context')
    return state === 'ready' || state === 'empty' || state === 'recovery';
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
    hasValue(snapshot.reconciliationContext)
  );
}

export function createSchedulingReleaseIntent(
  kind: SchedulingReleaseIntentKind,
  snapshot: SchedulingReleaseSnapshot,
): SchedulingReleaseIntent | undefined {
  if (kind === 'review_preview' && hasValue(snapshot.schedulePreviewReference)) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      schedulePreviewReference: snapshot.schedulePreviewReference,
      subjectScopeReference: snapshot.subjectScopeReference,
    });
  }
  if (kind === 'submit_release_intent') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      subjectScopeReference: snapshot.subjectScopeReference,
      ...(snapshot.traineeScopeReference === undefined
        ? {}
        : { traineeScopeReference: snapshot.traineeScopeReference }),
      definitionVersionReferences: Object.freeze([...snapshot.definitionVersionReferences]),
      scheduleReleaseIntentReference: snapshot.scheduleReleaseIntentReference,
      authoritativeCoachingTimeContext: snapshot.authoritativeCoachingTimeContext,
      effectiveTimeContext: snapshot.effectiveTimeContext,
      reason: Object.freeze({ ...snapshot.reason }),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
    });
  }
  if (kind === 'review_policy_context' && hasValue(snapshot.policyReference)) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      policyReference: snapshot.policyReference,
    });
  }
  if (kind === 'refresh_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      subjectScopeReference: snapshot.subjectScopeReference,
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
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getSchedulingReleaseViewModel(
  locale: SupportedLocale,
  state: SchedulingReleaseState,
  snapshot: SchedulingReleaseSnapshot,
  visibility: SchedulingReleaseVisibility,
): SchedulingReleaseViewModel {
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
    showPlan: presentation.show,
    visibleIntents: Object.freeze(schedulingReleaseIntentKinds.filter((kind) => visibility[kind])),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      workspaceReference: snapshot.workspaceReference,
      subjectScopeReference: snapshot.subjectScopeReference,
      traineeScopeReference: snapshot.traineeScopeReference,
      definitionVersionReferences: Object.freeze([...snapshot.definitionVersionReferences]),
      schedulePreviewReference: snapshot.schedulePreviewReference,
      scheduleReleaseIntentReference: snapshot.scheduleReleaseIntentReference,
      policyReference: snapshot.policyReference,
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
    }),
  };
}
