import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const confirmationReconciliationStates = [
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
  'existing_completion',
  'uncertain',
  'recovered',
  'durable_confirmed',
] as const;

export type ConfirmationReconciliationStateName = (typeof confirmationReconciliationStates)[number];

export const confirmationReconciliationErrorCodes = [
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

export type ConfirmationReconciliationErrorCode =
  (typeof confirmationReconciliationErrorCodes)[number];

export const confirmationReconciliationIntentKinds = [
  'refresh_projection',
  'reconcile',
  'retry',
] as const;

export type ConfirmationReconciliationIntentKind =
  (typeof confirmationReconciliationIntentKinds)[number];
export type ConfirmationReconciliationFeedbackRole = 'status' | 'alert';
export type ConfirmationReconciliationFeedbackTone = 'info' | 'danger' | 'warning' | 'success';
export type ConfirmationReconciliationOutcomeKind =
  'local_or_uncertain' | 'existing_completion' | 'durable_confirmed';

export interface ConfirmationReconciliationSnapshot {
  readonly scheduleCompletionOrCaseReference: string;
  readonly boundedRoleContext?: string;
  readonly statusReference: string;
  readonly statusHeading: string;
  readonly statusBody: string;
  readonly completionReference?: string;
  readonly reconciliationReference?: string;
  readonly evidenceReferences: readonly string[];
}

export interface ConfirmationReconciliationProjectionContext {
  readonly projectionKey: string;
  readonly sourceEvidenceReferences: readonly string[];
  readonly retryContext: string;
}

export type ConfirmationReconciliationVisibility = Readonly<
  Record<ConfirmationReconciliationIntentKind, boolean>
>;

export interface ConfirmationReconciliationCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly reconciliationHeading: string;
  readonly statusHeading: string;
  readonly evidenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly resumptionHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<ConfirmationReconciliationIntentKind, string>>;
  readonly feedback: Readonly<Record<ConfirmationReconciliationStateName, string>>;
}

export interface ConfirmationReconciliationContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly reconciliationBody: string;
  readonly evidenceBody: string;
  readonly localOutcomeBody: string;
  readonly existingCompletionBody: string;
  readonly durableConfirmedBody: string;
  readonly resumptionBody: string;
  readonly helpBody: string;
}

export type ConfirmationReconciliationIntent =
  | Readonly<{
      kind: 'refresh_projection';
      projectionKey: string;
      sourceEvidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'reconcile';
      scheduleCompletionOrCaseReference: string;
      reconciliationReference: string | undefined;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'retry';
      projectionKey: string;
      retryContext: string;
    }>;

export interface ConfirmationReconciliationViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ConfirmationReconciliationStateName;
  readonly feedbackRole: ConfirmationReconciliationFeedbackRole;
  readonly feedbackTone: ConfirmationReconciliationFeedbackTone;
  readonly showSnapshot: boolean;
  readonly durableConfirmed: boolean;
  readonly requiresReconciliation: boolean;
  readonly outcomeKind: ConfirmationReconciliationOutcomeKind;
  readonly visibleIntents: readonly ConfirmationReconciliationIntentKind[];
  readonly opaqueReferences: Readonly<{
    scheduleCompletionOrCaseReference: string;
    boundedRoleContext: string | undefined;
    statusReference: string;
    completionReference: string | undefined;
    reconciliationReference: string | undefined;
    evidenceReferences: readonly string[];
    projectionKey: string | undefined;
    sourceEvidenceReferences: readonly string[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showSnapshot: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showSnapshot: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showSnapshot: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showSnapshot: true },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showSnapshot: false,
  },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showSnapshot: false },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showSnapshot: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSnapshot: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSnapshot: false,
  },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showSnapshot: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSnapshot: true,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSnapshot: true,
  },
  lifecycle_conflict: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSnapshot: true,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showSnapshot: true },
  existing_completion: {
    feedbackRole: 'status',
    feedbackTone: 'info',
    showSnapshot: true,
  },
  uncertain: { feedbackRole: 'alert', feedbackTone: 'warning', showSnapshot: true },
  recovered: { feedbackRole: 'status', feedbackTone: 'info', showSnapshot: true },
  durable_confirmed: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showSnapshot: true,
  },
} as const satisfies Record<
  ConfirmationReconciliationStateName,
  {
    readonly feedbackRole: ConfirmationReconciliationFeedbackRole;
    readonly feedbackTone: ConfirmationReconciliationFeedbackTone;
    readonly showSnapshot: boolean;
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
} as const satisfies Record<
  ConfirmationReconciliationErrorCode,
  ConfirmationReconciliationStateName
>;

const reconciliationStates = new Set<ConfirmationReconciliationStateName>([
  'stale_or_conflicting_state',
  'duplicate_or_already_applied',
  'lifecycle_conflict',
  'existing_completion',
  'uncertain',
  'recovered',
]);

export function mapConfirmationReconciliationErrorCode(
  code: ConfirmationReconciliationErrorCode,
): ConfirmationReconciliationStateName {
  return stateByErrorCode[code];
}

export function isConfirmationReconciliationIntentEnabled(
  state: ConfirmationReconciliationStateName,
  kind: ConfirmationReconciliationIntentKind,
  snapshot: ConfirmationReconciliationSnapshot,
  projectionContext: ConfirmationReconciliationProjectionContext | undefined,
): boolean {
  if (kind === 'refresh_projection') {
    return (
      (state === 'ready' || state === 'uncertain' || state === 'recovered') &&
      projectionContext !== undefined &&
      projectionContext.sourceEvidenceReferences.length > 0
    );
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovered') &&
      projectionContext !== undefined
    );
  }

  return (
    reconciliationStates.has(state) &&
    (snapshot.evidenceReferences.length > 0 ||
      (projectionContext?.sourceEvidenceReferences.length ?? 0) > 0)
  );
}

export function createConfirmationReconciliationIntent(
  kind: ConfirmationReconciliationIntentKind,
  snapshot: ConfirmationReconciliationSnapshot,
  projectionContext: ConfirmationReconciliationProjectionContext | undefined,
): ConfirmationReconciliationIntent | undefined {
  if (
    kind === 'refresh_projection' &&
    projectionContext !== undefined &&
    projectionContext.sourceEvidenceReferences.length > 0
  ) {
    return Object.freeze({
      kind,
      projectionKey: projectionContext.projectionKey,
      sourceEvidenceReferences: Object.freeze([...projectionContext.sourceEvidenceReferences]),
    });
  }

  if (kind === 'reconcile') {
    const evidenceReferences = [
      ...snapshot.evidenceReferences,
      ...(projectionContext?.sourceEvidenceReferences ?? []),
    ];
    if (evidenceReferences.length === 0) {
      return undefined;
    }
    return Object.freeze({
      kind,
      scheduleCompletionOrCaseReference: snapshot.scheduleCompletionOrCaseReference,
      reconciliationReference: snapshot.reconciliationReference,
      evidenceReferences: Object.freeze(evidenceReferences),
    });
  }

  if (
    kind === 'retry' &&
    projectionContext !== undefined &&
    projectionContext.retryContext.length > 0
  ) {
    return Object.freeze({
      kind,
      projectionKey: projectionContext.projectionKey,
      retryContext: projectionContext.retryContext,
    });
  }

  return undefined;
}

export function getConfirmationReconciliationViewModel(
  locale: SupportedLocale,
  state: ConfirmationReconciliationStateName,
  snapshot: ConfirmationReconciliationSnapshot,
  visibility: ConfirmationReconciliationVisibility,
  projectionContext?: ConfirmationReconciliationProjectionContext,
): ConfirmationReconciliationViewModel {
  const presentation = statePresentation[state];
  const existingCompletion =
    state === 'existing_completion' || state === 'duplicate_or_already_applied';

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showSnapshot: presentation.showSnapshot,
    durableConfirmed: state === 'durable_confirmed',
    requiresReconciliation: reconciliationStates.has(state),
    outcomeKind:
      state === 'durable_confirmed'
        ? 'durable_confirmed'
        : existingCompletion
          ? 'existing_completion'
          : 'local_or_uncertain',
    visibleIntents: Object.freeze(
      confirmationReconciliationIntentKinds.filter((kind) => visibility[kind]),
    ),
    opaqueReferences: Object.freeze({
      scheduleCompletionOrCaseReference: snapshot.scheduleCompletionOrCaseReference,
      boundedRoleContext: snapshot.boundedRoleContext,
      statusReference: snapshot.statusReference,
      completionReference: snapshot.completionReference,
      reconciliationReference: snapshot.reconciliationReference,
      evidenceReferences: Object.freeze([...snapshot.evidenceReferences]),
      projectionKey: projectionContext?.projectionKey,
      sourceEvidenceReferences: Object.freeze([
        ...(projectionContext?.sourceEvidenceReferences ?? []),
      ]),
    }),
  };
}
