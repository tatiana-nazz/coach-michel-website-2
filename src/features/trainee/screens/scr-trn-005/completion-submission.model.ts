import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const completionSubmissionStates = [
  'loading',
  'ready',
  'empty',
  'validation_error',
  'authentication_required',
  'authority_denied',
  'resource_not_found',
  'dependency_unavailable',
  'rate_limited',
  'duplicate_or_already_applied',
  'lifecycle_conflict',
  'pending',
  'recovery',
  'durable_final',
] as const;

export type CompletionSubmissionState = (typeof completionSubmissionStates)[number];

export const completionSubmissionErrorCodes = [
  'VALIDATION_FAILED',
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'RESOURCE_NOT_FOUND',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'DUPLICATE_OR_ALREADY_APPLIED',
  'LIFECYCLE_CONFLICT',
] as const;

export type CompletionSubmissionErrorCode = (typeof completionSubmissionErrorCodes)[number];

export const completionSubmissionIntentKinds = [
  'submit_completion_intent',
  'retry',
  'reconcile_existing_completion',
] as const;

export type CompletionSubmissionIntentKind = (typeof completionSubmissionIntentKinds)[number];
export type CompletionSubmissionFeedbackRole = 'status' | 'alert';
export type CompletionSubmissionFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export const completionSubmissionPreflightIssues = [
  'schedule_reference_required',
  'business_intent_reference_required',
  'evidence_reference_required',
] as const;

export type CompletionSubmissionPreflightIssue =
  (typeof completionSubmissionPreflightIssues)[number];

export interface CompletionSubmissionContext {
  readonly scheduleReference: string;
  readonly businessIntentReference: string;
  readonly clientEvidenceReferences: readonly string[];
  readonly retryCorrelationReference?: string;
}

export type CompletionSubmissionVisibility = Readonly<
  Record<CompletionSubmissionIntentKind, boolean>
>;

export interface CompletionSubmissionCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly commandHeading: string;
  readonly evidenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly validationHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<CompletionSubmissionIntentKind, string>>;
  readonly validationMessages: Readonly<Record<CompletionSubmissionPreflightIssue, string>>;
  readonly feedback: Readonly<Record<CompletionSubmissionState, string>>;
}

export interface CompletionSubmissionContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly commandBody: string;
  readonly evidenceBody: string;
  readonly localAcknowledgementBody: string;
  readonly durableFinalBody: string;
  readonly helpBody: string;
}

export type CompletionSubmissionIntent =
  | Readonly<{
      kind: 'submit_completion_intent';
      scheduleReference: string;
      oneBusinessIntentReference: string;
      clientEvidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'retry';
      scheduleReference: string;
      retryCorrelationReference: string;
    }>
  | Readonly<{
      kind: 'reconcile_existing_completion';
      scheduleReference: string;
      clientEvidenceReferences: readonly string[];
    }>;

export interface CompletionSubmissionViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: CompletionSubmissionState;
  readonly feedbackRole: CompletionSubmissionFeedbackRole;
  readonly feedbackTone: CompletionSubmissionFeedbackTone;
  readonly showCommandContext: boolean;
  readonly durableFinal: boolean;
  readonly preflightIssues: readonly CompletionSubmissionPreflightIssue[];
  readonly visibleIntents: readonly CompletionSubmissionIntentKind[];
  readonly opaqueReferences: Readonly<{
    scheduleReference: string;
    businessIntentReference: string;
    clientEvidenceReferences: readonly string[];
    retryCorrelationReference: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showCommandContext: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showCommandContext: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showCommandContext: false },
  validation_error: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showCommandContext: true,
  },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showCommandContext: false,
  },
  authority_denied: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showCommandContext: false,
  },
  resource_not_found: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCommandContext: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCommandContext: false,
  },
  rate_limited: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCommandContext: false,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCommandContext: true,
  },
  lifecycle_conflict: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCommandContext: true,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showCommandContext: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showCommandContext: true },
  durable_final: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showCommandContext: true,
  },
} as const satisfies Record<
  CompletionSubmissionState,
  {
    readonly feedbackRole: CompletionSubmissionFeedbackRole;
    readonly feedbackTone: CompletionSubmissionFeedbackTone;
    readonly showCommandContext: boolean;
  }
>;

const stateByErrorCode = {
  VALIDATION_FAILED: 'validation_error',
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  DUPLICATE_OR_ALREADY_APPLIED: 'duplicate_or_already_applied',
  LIFECYCLE_CONFLICT: 'lifecycle_conflict',
} as const satisfies Record<CompletionSubmissionErrorCode, CompletionSubmissionState>;

export function mapCompletionSubmissionErrorCode(
  code: CompletionSubmissionErrorCode,
): CompletionSubmissionState {
  return stateByErrorCode[code];
}

export function validateCompletionSubmissionContext(
  context: CompletionSubmissionContext,
): readonly CompletionSubmissionPreflightIssue[] {
  const issues: CompletionSubmissionPreflightIssue[] = [];

  if (context.scheduleReference.trim().length === 0) {
    issues.push('schedule_reference_required');
  }
  if (context.businessIntentReference.trim().length === 0) {
    issues.push('business_intent_reference_required');
  }
  if (context.clientEvidenceReferences.length === 0) {
    issues.push('evidence_reference_required');
  }

  return Object.freeze(issues);
}

export function isCompletionSubmissionIntentEnabled(
  state: CompletionSubmissionState,
  kind: CompletionSubmissionIntentKind,
  context: CompletionSubmissionContext,
): boolean {
  if (kind === 'submit_completion_intent') {
    return state === 'ready' && validateCompletionSubmissionContext(context).length === 0;
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      context.retryCorrelationReference !== undefined &&
      context.retryCorrelationReference.length > 0
    );
  }

  return (
    (state === 'duplicate_or_already_applied' ||
      state === 'lifecycle_conflict' ||
      state === 'recovery') &&
    context.clientEvidenceReferences.length > 0
  );
}

export function createCompletionSubmissionIntent(
  kind: CompletionSubmissionIntentKind,
  context: CompletionSubmissionContext,
): CompletionSubmissionIntent | undefined {
  if (kind === 'submit_completion_intent') {
    if (validateCompletionSubmissionContext(context).length > 0) {
      return undefined;
    }
    return Object.freeze({
      kind,
      scheduleReference: context.scheduleReference,
      oneBusinessIntentReference: context.businessIntentReference,
      clientEvidenceReferences: Object.freeze([...context.clientEvidenceReferences]),
    });
  }

  if (
    kind === 'retry' &&
    context.retryCorrelationReference !== undefined &&
    context.retryCorrelationReference.length > 0
  ) {
    return Object.freeze({
      kind,
      scheduleReference: context.scheduleReference,
      retryCorrelationReference: context.retryCorrelationReference,
    });
  }

  if (kind === 'reconcile_existing_completion' && context.clientEvidenceReferences.length > 0) {
    return Object.freeze({
      kind,
      scheduleReference: context.scheduleReference,
      clientEvidenceReferences: Object.freeze([...context.clientEvidenceReferences]),
    });
  }

  return undefined;
}

export function getCompletionSubmissionViewModel(
  locale: SupportedLocale,
  state: CompletionSubmissionState,
  context: CompletionSubmissionContext,
  visibility: CompletionSubmissionVisibility,
): CompletionSubmissionViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showCommandContext: presentation.showCommandContext,
    durableFinal: state === 'durable_final',
    preflightIssues: validateCompletionSubmissionContext(context),
    visibleIntents: Object.freeze(
      completionSubmissionIntentKinds.filter((kind) => visibility[kind]),
    ),
    opaqueReferences: Object.freeze({
      scheduleReference: context.scheduleReference,
      businessIntentReference: context.businessIntentReference,
      clientEvidenceReferences: Object.freeze([...context.clientEvidenceReferences]),
      retryCorrelationReference: context.retryCorrelationReference,
    }),
  };
}
