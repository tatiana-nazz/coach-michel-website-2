import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const approvedNextStepHandoffStates = [
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

export type ApprovedNextStepHandoffState = (typeof approvedNextStepHandoffStates)[number];

export const approvedNextStepHandoffErrorCodes = [
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

export type ApprovedNextStepHandoffErrorCode = (typeof approvedNextStepHandoffErrorCodes)[number];

export const approvedNextStepHandoffIntentKinds = [
  'request_next_step',
  'support_privacy',
  'external_handoff',
  'retry',
  'reconcile',
] as const;

export type ApprovedNextStepHandoffIntentKind = (typeof approvedNextStepHandoffIntentKinds)[number];
export type ApprovedNextStepHandoffFeedbackRole = 'status' | 'alert';
export type ApprovedNextStepHandoffFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface ApprovedNextStepOption {
  readonly optionReference: string;
  readonly category: string;
  readonly value: string;
  readonly heading: string;
  readonly description: string;
}

export interface ApprovedNextStepHandoffExternalContext {
  readonly correlationReference: string;
  readonly minimumBusinessIntent: string;
  readonly purposeContext: string;
  readonly retryContext: string;
}

export interface ApprovedNextStepHandoffSupportPrivacyContext {
  readonly caseReference: string;
  readonly routeStatusEscalationIntent: string;
  readonly minimumEvidenceReferences: readonly string[];
  readonly reason: string;
}

export type ApprovedNextStepHandoffRoleCapabilityVisibility = Readonly<
  Record<ApprovedNextStepHandoffIntentKind, boolean>
>;

export interface ApprovedNextStepHandoffCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly optionsHeading: string;
  readonly optionsLegend: string;
  readonly consequenceHeading: string;
  readonly supportPrivacyHeading: string;
  readonly externalHandoffHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<ApprovedNextStepHandoffIntentKind, string>>;
  readonly feedback: Readonly<Record<ApprovedNextStepHandoffState, string>>;
}

export interface ApprovedNextStepHandoffContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly localConsequenceBody: string;
  readonly durableFinalConsequenceBody: string;
  readonly supportPrivacyBody: string;
  readonly externalHandoffBody: string;
  readonly helpBody: string;
}

interface IntentOptionSnapshot {
  readonly optionReference: string;
  readonly category: string;
  readonly value: string;
}

export type ApprovedNextStepHandoffIntent =
  | Readonly<{
      kind: 'request_next_step';
      option: IntentOptionSnapshot;
    }>
  | Readonly<{
      kind: 'support_privacy';
      caseReference: string;
      routeStatusEscalationIntent: string;
      minimumEvidenceReferences: readonly string[];
      reason: string;
    }>
  | Readonly<{
      kind: 'external_handoff';
      option: IntentOptionSnapshot;
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
      correlationReference: string;
      purposeContext: string;
    }>;

export interface ApprovedNextStepHandoffViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ApprovedNextStepHandoffState;
  readonly feedbackRole: ApprovedNextStepHandoffFeedbackRole;
  readonly feedbackTone: ApprovedNextStepHandoffFeedbackTone;
  readonly showOptions: boolean;
  readonly optionSelectionEnabled: boolean;
  readonly visibleIntents: readonly ApprovedNextStepHandoffIntentKind[];
  readonly durableFinal: boolean;
  readonly opaqueReferences: Readonly<{
    selectedOptionReference: string | undefined;
    optionReferences: readonly string[];
    correlationReference: string | undefined;
    caseReference: string | undefined;
    minimumEvidenceReferences: readonly string[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showOptions: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showOptions: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showOptions: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showOptions: true },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger', showOptions: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showOptions: false },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showOptions: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showOptions: false,
  },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning', showOptions: false },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showOptions: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showOptions: false,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showOptions: false,
  },
  lifecycle_conflict: { feedbackRole: 'alert', feedbackTone: 'warning', showOptions: false },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showOptions: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showOptions: true },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success', showOptions: false },
} as const satisfies Record<
  ApprovedNextStepHandoffState,
  {
    readonly feedbackRole: ApprovedNextStepHandoffFeedbackRole;
    readonly feedbackTone: ApprovedNextStepHandoffFeedbackTone;
    readonly showOptions: boolean;
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
} as const satisfies Record<ApprovedNextStepHandoffErrorCode, ApprovedNextStepHandoffState>;

function hasValue(value: string): boolean {
  return value.trim().length > 0;
}

function snapshotOption(option: ApprovedNextStepOption): IntentOptionSnapshot {
  return Object.freeze({
    optionReference: option.optionReference,
    category: option.category,
    value: option.value,
  });
}

export function mapApprovedNextStepHandoffErrorCode(
  code: ApprovedNextStepHandoffErrorCode,
): ApprovedNextStepHandoffState {
  return stateByErrorCode[code];
}

export function isApprovedNextStepHandoffIntentEnabled(
  state: ApprovedNextStepHandoffState,
  kind: ApprovedNextStepHandoffIntentKind,
  selectedOption: ApprovedNextStepOption | undefined,
  externalContext: ApprovedNextStepHandoffExternalContext | undefined,
  supportPrivacyContext: ApprovedNextStepHandoffSupportPrivacyContext | undefined,
): boolean {
  if (kind === 'request_next_step') {
    return state === 'ready' && selectedOption !== undefined;
  }

  if (kind === 'support_privacy') {
    return (
      (state === 'ready' || state === 'recovery') &&
      supportPrivacyContext !== undefined &&
      hasValue(supportPrivacyContext.caseReference) &&
      hasValue(supportPrivacyContext.routeStatusEscalationIntent) &&
      supportPrivacyContext.minimumEvidenceReferences.length > 0 &&
      hasValue(supportPrivacyContext.reason)
    );
  }

  if (kind === 'external_handoff') {
    return (
      (state === 'ready' || state === 'recovery') &&
      selectedOption !== undefined &&
      externalContext !== undefined &&
      hasValue(externalContext.correlationReference) &&
      hasValue(externalContext.minimumBusinessIntent) &&
      hasValue(externalContext.purposeContext) &&
      hasValue(externalContext.retryContext)
    );
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      externalContext !== undefined &&
      hasValue(externalContext.correlationReference) &&
      hasValue(externalContext.retryContext)
    );
  }

  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'duplicate_or_already_applied' ||
      state === 'lifecycle_conflict' ||
      state === 'recovery') &&
    externalContext !== undefined &&
    hasValue(externalContext.correlationReference) &&
    hasValue(externalContext.purposeContext)
  );
}

export function createApprovedNextStepHandoffIntent(
  kind: ApprovedNextStepHandoffIntentKind,
  selectedOption: ApprovedNextStepOption | undefined,
  externalContext: ApprovedNextStepHandoffExternalContext | undefined,
  supportPrivacyContext: ApprovedNextStepHandoffSupportPrivacyContext | undefined,
): ApprovedNextStepHandoffIntent | undefined {
  if (kind === 'request_next_step' && selectedOption !== undefined) {
    return Object.freeze({ kind, option: snapshotOption(selectedOption) });
  }

  if (kind === 'support_privacy' && supportPrivacyContext !== undefined) {
    return Object.freeze({
      kind,
      caseReference: supportPrivacyContext.caseReference,
      routeStatusEscalationIntent: supportPrivacyContext.routeStatusEscalationIntent,
      minimumEvidenceReferences: Object.freeze([
        ...supportPrivacyContext.minimumEvidenceReferences,
      ]),
      reason: supportPrivacyContext.reason,
    });
  }

  if (
    kind === 'external_handoff' &&
    selectedOption !== undefined &&
    externalContext !== undefined
  ) {
    return Object.freeze({
      kind,
      option: snapshotOption(selectedOption),
      correlationReference: externalContext.correlationReference,
      minimumBusinessIntent: externalContext.minimumBusinessIntent,
      purposeContext: externalContext.purposeContext,
      retryContext: externalContext.retryContext,
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
      correlationReference: externalContext.correlationReference,
      purposeContext: externalContext.purposeContext,
    });
  }

  return undefined;
}

export function getApprovedNextStepHandoffViewModel(
  locale: SupportedLocale,
  state: ApprovedNextStepHandoffState,
  options: readonly ApprovedNextStepOption[],
  selectedOptionReference: string | undefined,
  visibility: ApprovedNextStepHandoffRoleCapabilityVisibility,
  externalContext?: ApprovedNextStepHandoffExternalContext,
  supportPrivacyContext?: ApprovedNextStepHandoffSupportPrivacyContext,
): ApprovedNextStepHandoffViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showOptions: presentation.showOptions && options.length > 0,
    optionSelectionEnabled: state === 'ready' || state === 'validation_error',
    visibleIntents: Object.freeze(
      approvedNextStepHandoffIntentKinds.filter((kind) => visibility[kind]),
    ),
    durableFinal: state === 'durable_final',
    opaqueReferences: Object.freeze({
      selectedOptionReference,
      optionReferences: Object.freeze(options.map((option) => option.optionReference)),
      correlationReference: externalContext?.correlationReference,
      caseReference: supportPrivacyContext?.caseReference,
      minimumEvidenceReferences: Object.freeze([
        ...(supportPrivacyContext?.minimumEvidenceReferences ?? []),
      ]),
    }),
  };
}
