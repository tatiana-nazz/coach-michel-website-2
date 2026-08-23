import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const sessionPreparationStates = [
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

export type SessionPreparationState = (typeof sessionPreparationStates)[number];

export const sessionPreparationErrorCodes = [
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

export type SessionPreparationErrorCode = (typeof sessionPreparationErrorCodes)[number];

export const sessionPreparationIntentKinds = [
  'review_exercise',
  'prepare_session_draft_intent',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type SessionPreparationIntentKind = (typeof sessionPreparationIntentKinds)[number];
export type SessionPreparationFeedbackRole = 'status' | 'alert';
export type SessionPreparationFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface SessionPreparationSequenceStep {
  readonly sequenceReference: string;
  readonly orderingReference: string;
  readonly heading: string;
  readonly statusLabel: string;
  readonly body: string;
}

export interface SessionPreparationExercise {
  readonly exerciseReference: string;
  readonly orderingReference: string;
  readonly contentDraftReference?: string;
  readonly guidanceReference?: string;
  readonly displayLabel: string;
  readonly approvalStatusLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
}

export interface SessionPreparationGuidance {
  readonly guidanceReference: string;
  readonly heading: string;
  readonly body: string;
}

export interface SessionPreparationRecoveryContext {
  readonly retryContext: string;
  readonly reconciliationContext: string;
}

export interface SessionPreparationSnapshot {
  readonly traineeReference: string;
  readonly sessionReference: string;
  readonly programReference?: string;
  readonly sessionDraftReference?: string;
  readonly draftVersionReference?: string;
  readonly preparationIntentReference?: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly boundedTimeContext?: string;
  readonly sequence: readonly SessionPreparationSequenceStep[];
  readonly exercises: readonly SessionPreparationExercise[];
  readonly guidance: readonly SessionPreparationGuidance[];
  readonly evidenceReferences: readonly string[];
  readonly auditReferences: readonly string[];
  readonly draftIntentAvailable: boolean;
  readonly recoveryContext?: SessionPreparationRecoveryContext;
}

export type SessionPreparationVisibility = Readonly<Record<SessionPreparationIntentKind, boolean>>;

export interface SessionPreparationCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly preparationHeading: string;
  readonly sequenceHeading: string;
  readonly guidanceHeading: string;
  readonly evidenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<SessionPreparationIntentKind, string>>;
  readonly feedback: Readonly<Record<SessionPreparationState, string>>;
}

export interface SessionPreparationContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly preparationBody: string;
  readonly sequenceBody: string;
  readonly guidanceBody: string;
  readonly evidenceBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type SessionPreparationIntent =
  | Readonly<{
      kind: 'review_exercise';
      traineeReference: string;
      sessionReference: string;
      exerciseReference: string;
      contentDraftReference?: string;
      guidanceReference?: string;
    }>
  | Readonly<{
      kind: 'prepare_session_draft_intent';
      traineeReference: string;
      sessionReference: string;
      sessionDraftReference?: string;
      draftVersionReference?: string;
      preparationIntentReference?: string;
      exerciseReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'refresh_context';
      traineeReference: string;
      sessionReference: string;
      boundedTimeContext?: string;
    }>
  | Readonly<{
      kind: 'retry';
      sessionReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      sessionReference: string;
      evidenceReferences: readonly string[];
      auditReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface SessionPreparationViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: SessionPreparationState;
  readonly feedbackRole: SessionPreparationFeedbackRole;
  readonly feedbackTone: SessionPreparationFeedbackTone;
  readonly showContext: boolean;
  readonly visibleIntents: readonly SessionPreparationIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    traineeReference: string;
    sessionReference: string;
    programReference: string | undefined;
    sessionDraftReference: string | undefined;
    draftVersionReference: string | undefined;
    preparationIntentReference: string | undefined;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    sequenceReferences: readonly string[];
    orderingReferences: readonly string[];
    exerciseReferences: readonly string[];
    contentDraftReferences: readonly string[];
    guidanceReferences: readonly string[];
    evidenceReferences: readonly string[];
    auditReferences: readonly string[];
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
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showContext: false },
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
  lifecycle_conflict: {
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
  SessionPreparationState,
  {
    readonly feedbackRole: SessionPreparationFeedbackRole;
    readonly feedbackTone: SessionPreparationFeedbackTone;
    readonly showContext: boolean;
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
} as const satisfies Record<SessionPreparationErrorCode, SessionPreparationState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

export function mapSessionPreparationErrorCode(
  code: SessionPreparationErrorCode,
): SessionPreparationState {
  return stateByErrorCode[code];
}

export function isSessionPreparationIntentEnabled(
  state: SessionPreparationState,
  kind: SessionPreparationIntentKind,
  snapshot: SessionPreparationSnapshot,
  exercise?: SessionPreparationExercise,
): boolean {
  if (kind === 'review_exercise') {
    return (state === 'ready' || state === 'recovery') && exercise?.reviewAvailable === true;
  }

  if (kind === 'prepare_session_draft_intent') {
    return (
      (state === 'ready' || state === 'recovery') &&
      snapshot.draftIntentAvailable &&
      snapshot.exercises.length > 0
    );
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
      state === 'lifecycle_conflict' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    snapshot.evidenceReferences.length + snapshot.auditReferences.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  );
}

export function createSessionPreparationIntent(
  kind: SessionPreparationIntentKind,
  snapshot: SessionPreparationSnapshot,
  exercise?: SessionPreparationExercise,
): SessionPreparationIntent | undefined {
  if (kind === 'review_exercise' && exercise !== undefined && exercise.reviewAvailable) {
    return Object.freeze({
      kind,
      traineeReference: snapshot.traineeReference,
      sessionReference: snapshot.sessionReference,
      exerciseReference: exercise.exerciseReference,
      ...(exercise.contentDraftReference === undefined
        ? {}
        : { contentDraftReference: exercise.contentDraftReference }),
      ...(exercise.guidanceReference === undefined
        ? {}
        : { guidanceReference: exercise.guidanceReference }),
    });
  }

  if (kind === 'prepare_session_draft_intent' && snapshot.draftIntentAvailable) {
    return Object.freeze({
      kind,
      traineeReference: snapshot.traineeReference,
      sessionReference: snapshot.sessionReference,
      ...(snapshot.sessionDraftReference === undefined
        ? {}
        : { sessionDraftReference: snapshot.sessionDraftReference }),
      ...(snapshot.draftVersionReference === undefined
        ? {}
        : { draftVersionReference: snapshot.draftVersionReference }),
      ...(snapshot.preparationIntentReference === undefined
        ? {}
        : { preparationIntentReference: snapshot.preparationIntentReference }),
      exerciseReferences: Object.freeze(snapshot.exercises.map((item) => item.exerciseReference)),
    });
  }

  if (kind === 'refresh_context') {
    return Object.freeze({
      kind,
      traineeReference: snapshot.traineeReference,
      sessionReference: snapshot.sessionReference,
      ...(snapshot.boundedTimeContext === undefined
        ? {}
        : { boundedTimeContext: snapshot.boundedTimeContext }),
    });
  }

  if (kind === 'retry' && hasValue(snapshot.recoveryContext?.retryContext)) {
    return Object.freeze({
      kind,
      sessionReference: snapshot.sessionReference,
      retryContext: snapshot.recoveryContext.retryContext,
    });
  }

  if (
    kind === 'reconcile' &&
    snapshot.evidenceReferences.length + snapshot.auditReferences.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  ) {
    return Object.freeze({
      kind,
      sessionReference: snapshot.sessionReference,
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      auditReferences: Object.freeze([...snapshot.auditReferences]),
      reconciliationContext: snapshot.recoveryContext.reconciliationContext,
    });
  }

  return undefined;
}

export function getSessionPreparationViewModel(
  locale: SupportedLocale,
  state: SessionPreparationState,
  snapshot: SessionPreparationSnapshot,
  visibility: SessionPreparationVisibility,
): SessionPreparationViewModel {
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
    showContext:
      presentation.showContext &&
      snapshot.sequence.length + snapshot.exercises.length + snapshot.guidance.length > 0,
    visibleIntents: Object.freeze(sessionPreparationIntentKinds.filter((kind) => visibility[kind])),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      traineeReference: snapshot.traineeReference,
      sessionReference: snapshot.sessionReference,
      programReference: snapshot.programReference,
      sessionDraftReference: snapshot.sessionDraftReference,
      draftVersionReference: snapshot.draftVersionReference,
      preparationIntentReference: snapshot.preparationIntentReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      sequenceReferences: Object.freeze(snapshot.sequence.map((step) => step.sequenceReference)),
      orderingReferences: Object.freeze([
        ...snapshot.sequence.map((step) => step.orderingReference),
        ...snapshot.exercises.map((exercise) => exercise.orderingReference),
      ]),
      exerciseReferences: Object.freeze(
        snapshot.exercises.map((exercise) => exercise.exerciseReference),
      ),
      contentDraftReferences: Object.freeze(
        snapshot.exercises.flatMap((exercise) =>
          exercise.contentDraftReference === undefined ? [] : [exercise.contentDraftReference],
        ),
      ),
      guidanceReferences: Object.freeze([
        ...snapshot.guidance.map((guidance) => guidance.guidanceReference),
        ...snapshot.exercises.flatMap((exercise) =>
          exercise.guidanceReference === undefined ? [] : [exercise.guidanceReference],
        ),
      ]),
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      auditReferences: Object.freeze([...snapshot.auditReferences]),
    }),
  };
}
