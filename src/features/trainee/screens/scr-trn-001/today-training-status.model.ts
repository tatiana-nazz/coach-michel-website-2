import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const todayTrainingStatusStates = [
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
  'duplicate_or_already_applied',
  'lifecycle_conflict',
  'pending',
  'recovery',
  'durable_final',
] as const;

export type TodayTrainingStatusState = (typeof todayTrainingStatusStates)[number];

export const todayTrainingStatusErrorCodes = [
  'VALIDATION_FAILED',
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'RESOURCE_NOT_FOUND',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'STALE_OR_CONFLICTING_STATE',
  'DUPLICATE_OR_ALREADY_APPLIED',
  'LIFECYCLE_CONFLICT',
] as const;

export type TodayTrainingStatusErrorCode = (typeof todayTrainingStatusErrorCodes)[number];

export const todayTrainingStatusIntentKinds = [
  'request_next_action',
  'refresh_projection',
  'retry',
  'reconcile',
] as const;

export type TodayTrainingStatusIntentKind = (typeof todayTrainingStatusIntentKinds)[number];
export type TodayTrainingStatusFeedbackRole = 'status' | 'alert';
export type TodayTrainingStatusFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface TodayTrainingStatusSnapshot {
  readonly coachingDayContext: string;
  readonly sessionReference?: string;
  readonly statusReference: string;
  readonly statusHeading: string;
  readonly statusBody: string;
  readonly nextActionReference?: string;
  readonly nextActionHeading: string;
  readonly nextActionBody: string;
}

export interface TodayTrainingProjectionContext {
  readonly projectionKey: string;
  readonly sourceEvidenceReferences: readonly string[];
  readonly retryContext: string;
}

export type TodayTrainingStatusVisibility = Readonly<
  Record<TodayTrainingStatusIntentKind, boolean>
>;

export interface TodayTrainingStatusCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly statusHeading: string;
  readonly nextActionHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<TodayTrainingStatusIntentKind, string>>;
  readonly feedback: Readonly<Record<TodayTrainingStatusState, string>>;
}

export interface TodayTrainingStatusContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly localConsequenceBody: string;
  readonly durableFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type TodayTrainingStatusIntent =
  | Readonly<{
      kind: 'request_next_action';
      statusReference: string;
      sessionReference: string | undefined;
      nextActionReference: string;
    }>
  | Readonly<{
      kind: 'refresh_projection';
      projectionKey: string;
      sourceEvidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'retry';
      projectionKey: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      statusReference: string;
      sourceEvidenceReferences: readonly string[];
    }>;

export interface TodayTrainingStatusViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: TodayTrainingStatusState;
  readonly feedbackRole: TodayTrainingStatusFeedbackRole;
  readonly feedbackTone: TodayTrainingStatusFeedbackTone;
  readonly showStatus: boolean;
  readonly durableFinal: boolean;
  readonly visibleIntents: readonly TodayTrainingStatusIntentKind[];
  readonly opaqueReferences: Readonly<{
    coachingDayContext: string;
    sessionReference: string | undefined;
    statusReference: string;
    nextActionReference: string | undefined;
    projectionKey: string | undefined;
    sourceEvidenceReferences: readonly string[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showStatus: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showStatus: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showStatus: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showStatus: true },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger', showStatus: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showStatus: false },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showStatus: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showStatus: false,
  },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning', showStatus: false },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showStatus: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showStatus: false,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showStatus: false,
  },
  lifecycle_conflict: { feedbackRole: 'alert', feedbackTone: 'warning', showStatus: false },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showStatus: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showStatus: true },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success', showStatus: true },
} as const satisfies Record<
  TodayTrainingStatusState,
  {
    readonly feedbackRole: TodayTrainingStatusFeedbackRole;
    readonly feedbackTone: TodayTrainingStatusFeedbackTone;
    readonly showStatus: boolean;
  }
>;

const stateByErrorCode = {
  VALIDATION_FAILED: 'validation_error',
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
  DUPLICATE_OR_ALREADY_APPLIED: 'duplicate_or_already_applied',
  LIFECYCLE_CONFLICT: 'lifecycle_conflict',
} as const satisfies Record<TodayTrainingStatusErrorCode, TodayTrainingStatusState>;

export function mapTodayTrainingStatusErrorCode(
  code: TodayTrainingStatusErrorCode,
): TodayTrainingStatusState {
  return stateByErrorCode[code];
}

export function isTodayTrainingStatusIntentEnabled(
  state: TodayTrainingStatusState,
  kind: TodayTrainingStatusIntentKind,
  snapshot: TodayTrainingStatusSnapshot,
  projectionContext: TodayTrainingProjectionContext | undefined,
): boolean {
  if (kind === 'request_next_action') {
    return state === 'ready' && snapshot.nextActionReference !== undefined;
  }

  if (kind === 'refresh_projection') {
    return (
      (state === 'ready' || state === 'recovery') &&
      projectionContext !== undefined &&
      projectionContext.sourceEvidenceReferences.length > 0
    );
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      projectionContext !== undefined
    );
  }

  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'duplicate_or_already_applied' ||
      state === 'lifecycle_conflict' ||
      state === 'recovery') &&
    projectionContext !== undefined &&
    projectionContext.sourceEvidenceReferences.length > 0
  );
}

export function createTodayTrainingStatusIntent(
  kind: TodayTrainingStatusIntentKind,
  snapshot: TodayTrainingStatusSnapshot,
  projectionContext: TodayTrainingProjectionContext | undefined,
): TodayTrainingStatusIntent | undefined {
  if (kind === 'request_next_action' && snapshot.nextActionReference !== undefined) {
    return Object.freeze({
      kind,
      statusReference: snapshot.statusReference,
      sessionReference: snapshot.sessionReference,
      nextActionReference: snapshot.nextActionReference,
    });
  }

  if (kind === 'refresh_projection' && projectionContext !== undefined) {
    return Object.freeze({
      kind,
      projectionKey: projectionContext.projectionKey,
      sourceEvidenceReferences: Object.freeze([...projectionContext.sourceEvidenceReferences]),
    });
  }

  if (kind === 'retry' && projectionContext !== undefined) {
    return Object.freeze({
      kind,
      projectionKey: projectionContext.projectionKey,
      retryContext: projectionContext.retryContext,
    });
  }

  if (kind === 'reconcile' && projectionContext !== undefined) {
    return Object.freeze({
      kind,
      statusReference: snapshot.statusReference,
      sourceEvidenceReferences: Object.freeze([...projectionContext.sourceEvidenceReferences]),
    });
  }

  return undefined;
}

export function getTodayTrainingStatusViewModel(
  locale: SupportedLocale,
  state: TodayTrainingStatusState,
  snapshot: TodayTrainingStatusSnapshot,
  visibility: TodayTrainingStatusVisibility,
  projectionContext?: TodayTrainingProjectionContext,
): TodayTrainingStatusViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showStatus: presentation.showStatus,
    durableFinal: state === 'durable_final',
    visibleIntents: Object.freeze(
      todayTrainingStatusIntentKinds.filter((kind) => visibility[kind]),
    ),
    opaqueReferences: Object.freeze({
      coachingDayContext: snapshot.coachingDayContext,
      sessionReference: snapshot.sessionReference,
      statusReference: snapshot.statusReference,
      nextActionReference: snapshot.nextActionReference,
      projectionKey: projectionContext?.projectionKey,
      sourceEvidenceReferences: Object.freeze([
        ...(projectionContext?.sourceEvidenceReferences ?? []),
      ]),
    }),
  };
}
