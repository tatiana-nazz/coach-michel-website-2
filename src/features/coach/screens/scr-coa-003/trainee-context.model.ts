import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const traineeContextStates = [
  'loading',
  'ready',
  'empty',
  'validation_error',
  'authentication_required',
  'authority_denied',
  'resource_not_found_or_unavailable',
  'dependency_unavailable',
  'rate_limited',
  'stale_or_conflicting_state',
  'duplicate_or_already_applied',
  'pending',
  'recovery',
  'authoritative_final',
] as const;

export type TraineeContextState = (typeof traineeContextStates)[number];

export const traineeContextErrorCodes = [
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type TraineeContextErrorCode = (typeof traineeContextErrorCodes)[number];

export const traineeContextIntentKinds = [
  'review_context_item',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type TraineeContextIntentKind = (typeof traineeContextIntentKinds)[number];
export type TraineeContextFeedbackRole = 'status' | 'alert';
export type TraineeContextFeedbackTone = 'info' | 'danger' | 'warning' | 'success';
export type TraineeContextSummaryCategory = 'assignment' | 'session' | 'completion' | 'adherence';

export interface TraineeContextSummary {
  readonly summaryReference: string;
  readonly category: TraineeContextSummaryCategory;
  readonly heading: string;
  readonly statusLabel: string;
  readonly body: string;
  readonly reviewAvailable: boolean;
}

export interface TraineeContextRecoveryContext {
  readonly retryContext: string;
  readonly reconciliationContext: string;
}

export interface TraineeContextSnapshot {
  readonly traineeReference: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly boundedTimeContext?: string;
  readonly summaries: readonly TraineeContextSummary[];
  readonly evidenceReferences: readonly string[];
  readonly recoveryContext?: TraineeContextRecoveryContext;
}

export type TraineeContextVisibility = Readonly<Record<TraineeContextIntentKind, boolean>>;

export interface TraineeContextCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly summariesHeading: string;
  readonly progressHeading: string;
  readonly evidenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<TraineeContextIntentKind, string>>;
  readonly feedback: Readonly<Record<TraineeContextState, string>>;
}

export interface TraineeContextContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly summariesBody: string;
  readonly progressBody: string;
  readonly evidenceBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type TraineeContextIntent =
  | Readonly<{
      kind: 'review_context_item';
      traineeReference: string;
      summaryReference: string;
      category: TraineeContextSummaryCategory;
    }>
  | Readonly<{
      kind: 'refresh_context';
      traineeReference: string;
      boundedTimeContext?: string;
    }>
  | Readonly<{
      kind: 'retry';
      traineeReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      traineeReference: string;
      evidenceReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface TraineeContextViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: TraineeContextState;
  readonly feedbackRole: TraineeContextFeedbackRole;
  readonly feedbackTone: TraineeContextFeedbackTone;
  readonly showContext: boolean;
  readonly visibleIntents: readonly TraineeContextIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    traineeReference: string;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    summaryReferences: readonly string[];
    evidenceReferences: readonly string[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showContext: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showContext: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showContext: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showContext: true },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showContext: false,
  },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showContext: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showContext: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showContext: false,
  },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showContext: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showContext: true,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showContext: true,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showContext: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showContext: true },
  authoritative_final: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showContext: true,
  },
} as const satisfies Record<
  TraineeContextState,
  {
    readonly feedbackRole: TraineeContextFeedbackRole;
    readonly feedbackTone: TraineeContextFeedbackTone;
    readonly showContext: boolean;
  }
>;

const stateByErrorCode = {
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<TraineeContextErrorCode, TraineeContextState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

export function mapTraineeContextErrorCode(code: TraineeContextErrorCode): TraineeContextState {
  return stateByErrorCode[code];
}

export function isTraineeContextIntentEnabled(
  state: TraineeContextState,
  kind: TraineeContextIntentKind,
  snapshot: TraineeContextSnapshot,
  summary?: TraineeContextSummary,
): boolean {
  if (kind === 'review_context_item') {
    return (state === 'ready' || state === 'recovery') && summary?.reviewAvailable === true;
  }

  if (kind === 'refresh_context') {
    return state === 'ready' || state === 'empty' || state === 'recovery';
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      hasValue(snapshot.recoveryContext?.retryContext)
    );
  }

  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    snapshot.evidenceReferences.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  );
}

export function createTraineeContextIntent(
  kind: TraineeContextIntentKind,
  snapshot: TraineeContextSnapshot,
  summary?: TraineeContextSummary,
): TraineeContextIntent | undefined {
  if (kind === 'review_context_item' && summary !== undefined && summary.reviewAvailable) {
    return Object.freeze({
      kind,
      traineeReference: snapshot.traineeReference,
      summaryReference: summary.summaryReference,
      category: summary.category,
    });
  }

  if (kind === 'refresh_context') {
    return Object.freeze({
      kind,
      traineeReference: snapshot.traineeReference,
      ...(snapshot.boundedTimeContext === undefined
        ? {}
        : { boundedTimeContext: snapshot.boundedTimeContext }),
    });
  }

  if (kind === 'retry' && hasValue(snapshot.recoveryContext?.retryContext)) {
    return Object.freeze({
      kind,
      traineeReference: snapshot.traineeReference,
      retryContext: snapshot.recoveryContext.retryContext,
    });
  }

  if (
    kind === 'reconcile' &&
    snapshot.evidenceReferences.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  ) {
    return Object.freeze({
      kind,
      traineeReference: snapshot.traineeReference,
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      reconciliationContext: snapshot.recoveryContext.reconciliationContext,
    });
  }

  return undefined;
}

export function getTraineeContextViewModel(
  locale: SupportedLocale,
  state: TraineeContextState,
  snapshot: TraineeContextSnapshot,
  visibility: TraineeContextVisibility,
): TraineeContextViewModel {
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
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showContext: presentation.showContext && snapshot.summaries.length > 0,
    visibleIntents: Object.freeze(traineeContextIntentKinds.filter((kind) => visibility[kind])),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      traineeReference: snapshot.traineeReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      summaryReferences: Object.freeze(
        snapshot.summaries.map((summary) => summary.summaryReference),
      ),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
    }),
  };
}
