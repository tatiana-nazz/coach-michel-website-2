import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const exerciseSequenceStates = [
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
  'pending',
  'recovery',
  'durable_final',
] as const;

export type ExerciseSequenceState = (typeof exerciseSequenceStates)[number];

export const exerciseSequenceErrorCodes = [
  'VALIDATION_FAILED',
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type ExerciseSequenceErrorCode = (typeof exerciseSequenceErrorCodes)[number];

export const exerciseSequenceIntentKinds = ['request_exercise', 'retry', 'reconcile'] as const;
export type ExerciseSequenceIntentKind = (typeof exerciseSequenceIntentKinds)[number];
export type ExerciseSequenceFeedbackRole = 'status' | 'alert';
export type ExerciseSequenceFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface ExerciseSequenceItem {
  readonly exerciseReference: string;
  readonly heading: string;
  readonly summary: string;
  readonly statusLabel: string;
  readonly availableForIntent: boolean;
}

export interface ExerciseSequenceSnapshot {
  readonly sessionScheduleReference: string;
  readonly currentExerciseReference?: string;
  readonly progressLabel: string;
  readonly progressValue: number;
  readonly progressMaximum: number;
  readonly items: readonly ExerciseSequenceItem[];
}

export interface ExerciseSequenceRecoveryContext {
  readonly retryContext: string;
  readonly reconciliationContext: string;
}

export type ExerciseSequenceVisibility = Readonly<Record<ExerciseSequenceIntentKind, boolean>>;

export interface ExerciseSequenceCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly progressHeading: string;
  readonly sequenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<ExerciseSequenceIntentKind, string>>;
  readonly feedback: Readonly<Record<ExerciseSequenceState, string>>;
}

export interface ExerciseSequenceContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly localConsequenceBody: string;
  readonly durableFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type ExerciseSequenceIntent =
  | Readonly<{
      kind: 'request_exercise';
      sessionScheduleReference: string;
      exerciseReference: string;
    }>
  | Readonly<{
      kind: 'retry';
      sessionScheduleReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      sessionScheduleReference: string;
      reconciliationContext: string;
    }>;

export interface ExerciseSequenceViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ExerciseSequenceState;
  readonly feedbackRole: ExerciseSequenceFeedbackRole;
  readonly feedbackTone: ExerciseSequenceFeedbackTone;
  readonly showSequence: boolean;
  readonly durableFinal: boolean;
  readonly visibleRecoveryIntents: readonly Exclude<
    ExerciseSequenceIntentKind,
    'request_exercise'
  >[];
  readonly opaqueReferences: Readonly<{
    sessionScheduleReference: string;
    currentExerciseReference: string | undefined;
    exerciseReferences: readonly string[];
    retryContext: string | undefined;
    reconciliationContext: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showSequence: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showSequence: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showSequence: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showSequence: true },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger', showSequence: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showSequence: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSequence: false,
  },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning', showSequence: false },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showSequence: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSequence: false,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showSequence: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showSequence: true },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success', showSequence: true },
} as const satisfies Record<
  ExerciseSequenceState,
  {
    readonly feedbackRole: ExerciseSequenceFeedbackRole;
    readonly feedbackTone: ExerciseSequenceFeedbackTone;
    readonly showSequence: boolean;
  }
>;

const stateByErrorCode = {
  VALIDATION_FAILED: 'validation_error',
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<ExerciseSequenceErrorCode, ExerciseSequenceState>;

export function mapExerciseSequenceErrorCode(
  code: ExerciseSequenceErrorCode,
): ExerciseSequenceState {
  return stateByErrorCode[code];
}

export function isExerciseSequenceIntentEnabled(
  state: ExerciseSequenceState,
  kind: ExerciseSequenceIntentKind,
  item: ExerciseSequenceItem | undefined,
  recoveryContext: ExerciseSequenceRecoveryContext | undefined,
): boolean {
  if (kind === 'request_exercise') {
    return state === 'ready' && item?.availableForIntent === true;
  }
  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      recoveryContext !== undefined
    );
  }
  return (
    (state === 'stale_or_conflicting_state' || state === 'recovery') &&
    recoveryContext !== undefined
  );
}

export function createExerciseSequenceIntent(
  kind: ExerciseSequenceIntentKind,
  snapshot: ExerciseSequenceSnapshot,
  item: ExerciseSequenceItem | undefined,
  recoveryContext: ExerciseSequenceRecoveryContext | undefined,
): ExerciseSequenceIntent | undefined {
  if (kind === 'request_exercise' && item !== undefined) {
    return Object.freeze({
      kind,
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: item.exerciseReference,
    });
  }
  if (kind === 'retry' && recoveryContext !== undefined) {
    return Object.freeze({
      kind,
      sessionScheduleReference: snapshot.sessionScheduleReference,
      retryContext: recoveryContext.retryContext,
    });
  }
  if (kind === 'reconcile' && recoveryContext !== undefined) {
    return Object.freeze({
      kind,
      sessionScheduleReference: snapshot.sessionScheduleReference,
      reconciliationContext: recoveryContext.reconciliationContext,
    });
  }
  return undefined;
}

export function getExerciseSequenceViewModel(
  locale: SupportedLocale,
  state: ExerciseSequenceState,
  snapshot: ExerciseSequenceSnapshot,
  visibility: ExerciseSequenceVisibility,
  recoveryContext?: ExerciseSequenceRecoveryContext,
): ExerciseSequenceViewModel {
  const presentation = statePresentation[state];
  const recoveryKinds = exerciseSequenceIntentKinds.filter(
    (kind): kind is Exclude<ExerciseSequenceIntentKind, 'request_exercise'> =>
      kind !== 'request_exercise' && visibility[kind],
  );

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showSequence: presentation.showSequence && snapshot.items.length > 0,
    durableFinal: state === 'durable_final',
    visibleRecoveryIntents: Object.freeze(recoveryKinds),
    opaqueReferences: Object.freeze({
      sessionScheduleReference: snapshot.sessionScheduleReference,
      currentExerciseReference: snapshot.currentExerciseReference,
      exerciseReferences: Object.freeze(snapshot.items.map((item) => item.exerciseReference)),
      retryContext: recoveryContext?.retryContext,
      reconciliationContext: recoveryContext?.reconciliationContext,
    }),
  };
}
