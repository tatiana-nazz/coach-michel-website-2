import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const exerciseGuidanceItemStates = [
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

export type ExerciseGuidanceItemState = (typeof exerciseGuidanceItemStates)[number];

export const exerciseGuidanceItemErrorCodes = [
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

export type ExerciseGuidanceItemErrorCode = (typeof exerciseGuidanceItemErrorCodes)[number];

export const exerciseGuidanceItemIntentKinds = [
  'request_guidance_action',
  'support_privacy',
  'external_handoff',
  'retry',
  'reconcile',
] as const;

export type ExerciseGuidanceItemIntentKind = (typeof exerciseGuidanceItemIntentKinds)[number];
export type ExerciseGuidanceItemFeedbackRole = 'status' | 'alert';
export type ExerciseGuidanceItemFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface ExerciseGuidanceInstruction {
  readonly instructionReference: string;
  readonly heading: string;
  readonly body: string;
}

export interface ExerciseGuidanceMediaItem {
  readonly mediaReference: string;
  readonly accessibleLabel: string;
  readonly caption: string;
  readonly rightsEvidenceReference: string;
}

export interface ExerciseGuidanceSnapshot {
  readonly sessionScheduleReference: string;
  readonly exerciseReference: string;
  readonly exerciseHeading: string;
  readonly exerciseSummary: string;
  readonly progressLabel: string;
  readonly instructions: readonly ExerciseGuidanceInstruction[];
  readonly media: readonly ExerciseGuidanceMediaItem[];
  readonly actionReference?: string;
}

export interface ExerciseGuidanceExternalContext {
  readonly correlationReference: string;
  readonly minimumBusinessIntent: string;
  readonly purposeContext: string;
  readonly retryContext: string;
}

export type ExerciseGuidanceItemVisibility = Readonly<
  Record<ExerciseGuidanceItemIntentKind, boolean>
>;

export interface ExerciseGuidanceItemCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly progressHeading: string;
  readonly instructionsHeading: string;
  readonly mediaHeading: string;
  readonly consequenceHeading: string;
  readonly externalHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<ExerciseGuidanceItemIntentKind, string>>;
  readonly feedback: Readonly<Record<ExerciseGuidanceItemState, string>>;
}

export interface ExerciseGuidanceItemContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly localConsequenceBody: string;
  readonly durableFinalConsequenceBody: string;
  readonly externalBody: string;
  readonly helpBody: string;
}

export type ExerciseGuidanceItemIntent =
  | Readonly<{
      kind: 'request_guidance_action';
      sessionScheduleReference: string;
      exerciseReference: string;
      actionReference: string;
    }>
  | Readonly<{
      kind: 'support_privacy' | 'external_handoff';
      sessionScheduleReference: string;
      exerciseReference: string;
      correlationReference: string;
      minimumBusinessIntent: string;
      purposeContext: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'retry';
      correlationReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      sessionScheduleReference: string;
      exerciseReference: string;
      correlationReference: string;
      purposeContext: string;
    }>;

export interface ExerciseGuidanceItemViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ExerciseGuidanceItemState;
  readonly feedbackRole: ExerciseGuidanceItemFeedbackRole;
  readonly feedbackTone: ExerciseGuidanceItemFeedbackTone;
  readonly showGuidance: boolean;
  readonly durableFinal: boolean;
  readonly visibleIntents: readonly ExerciseGuidanceItemIntentKind[];
  readonly opaqueReferences: Readonly<{
    sessionScheduleReference: string;
    exerciseReference: string;
    instructionReferences: readonly string[];
    mediaReferences: readonly string[];
    rightsEvidenceReferences: readonly string[];
    actionReference: string | undefined;
    correlationReference: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showGuidance: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showGuidance: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showGuidance: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showGuidance: true },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger', showGuidance: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showGuidance: false },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showGuidance: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showGuidance: false,
  },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning', showGuidance: false },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showGuidance: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showGuidance: false,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showGuidance: false,
  },
  lifecycle_conflict: { feedbackRole: 'alert', feedbackTone: 'warning', showGuidance: false },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showGuidance: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showGuidance: true },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success', showGuidance: true },
} as const satisfies Record<
  ExerciseGuidanceItemState,
  {
    readonly feedbackRole: ExerciseGuidanceItemFeedbackRole;
    readonly feedbackTone: ExerciseGuidanceItemFeedbackTone;
    readonly showGuidance: boolean;
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
} as const satisfies Record<ExerciseGuidanceItemErrorCode, ExerciseGuidanceItemState>;

export function mapExerciseGuidanceItemErrorCode(
  code: ExerciseGuidanceItemErrorCode,
): ExerciseGuidanceItemState {
  return stateByErrorCode[code];
}

export function isExerciseGuidanceItemIntentEnabled(
  state: ExerciseGuidanceItemState,
  kind: ExerciseGuidanceItemIntentKind,
  snapshot: ExerciseGuidanceSnapshot,
  externalContext: ExerciseGuidanceExternalContext | undefined,
): boolean {
  if (kind === 'request_guidance_action') {
    return state === 'ready' && snapshot.actionReference !== undefined;
  }
  if (kind === 'support_privacy' || kind === 'external_handoff') {
    return (state === 'ready' || state === 'recovery') && externalContext !== undefined;
  }
  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      externalContext !== undefined
    );
  }
  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'duplicate_or_already_applied' ||
      state === 'lifecycle_conflict' ||
      state === 'recovery') &&
    externalContext !== undefined
  );
}

export function createExerciseGuidanceItemIntent(
  kind: ExerciseGuidanceItemIntentKind,
  snapshot: ExerciseGuidanceSnapshot,
  externalContext: ExerciseGuidanceExternalContext | undefined,
): ExerciseGuidanceItemIntent | undefined {
  if (kind === 'request_guidance_action' && snapshot.actionReference !== undefined) {
    return Object.freeze({
      kind,
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: snapshot.exerciseReference,
      actionReference: snapshot.actionReference,
    });
  }
  if (
    (kind === 'support_privacy' || kind === 'external_handoff') &&
    externalContext !== undefined
  ) {
    return Object.freeze({
      kind,
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: snapshot.exerciseReference,
      ...externalContext,
    });
  }
  if (kind === 'retry' && externalContext !== undefined) {
    return Object.freeze({
      kind,
      correlationReference: externalContext.correlationReference,
      retryContext: externalContext.retryContext,
    });
  }
  if (kind === 'reconcile' && externalContext !== undefined) {
    return Object.freeze({
      kind,
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: snapshot.exerciseReference,
      correlationReference: externalContext.correlationReference,
      purposeContext: externalContext.purposeContext,
    });
  }
  return undefined;
}

export function getExerciseGuidanceItemViewModel(
  locale: SupportedLocale,
  state: ExerciseGuidanceItemState,
  snapshot: ExerciseGuidanceSnapshot,
  visibility: ExerciseGuidanceItemVisibility,
  externalContext?: ExerciseGuidanceExternalContext,
): ExerciseGuidanceItemViewModel {
  const presentation = statePresentation[state];
  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showGuidance: presentation.showGuidance,
    durableFinal: state === 'durable_final',
    visibleIntents: Object.freeze(
      exerciseGuidanceItemIntentKinds.filter((kind) => visibility[kind]),
    ),
    opaqueReferences: Object.freeze({
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: snapshot.exerciseReference,
      instructionReferences: Object.freeze(
        snapshot.instructions.map((item) => item.instructionReference),
      ),
      mediaReferences: Object.freeze(snapshot.media.map((item) => item.mediaReference)),
      rightsEvidenceReferences: Object.freeze(
        snapshot.media.map((item) => item.rightsEvidenceReference),
      ),
      actionReference: snapshot.actionReference,
      correlationReference: externalContext?.correlationReference,
    }),
  };
}
