import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const externalSupportHandoffStates = [
  'loading',
  'ready',
  'empty',
  'validation_error',
  'authentication_required',
  'authority_denied',
  'resource_not_found',
  'dependency_unavailable',
  'rate_limited',
  'stale_or_conflicting_state',
  'duplicate_or_already_applied',
  'lifecycle_conflict',
  'pending',
  'local_acknowledgement',
  'routed_or_escalated',
  'external_handoff',
  'recovery',
  'durable_final',
] as const;

export type ExternalSupportHandoffState = (typeof externalSupportHandoffStates)[number];

export const externalSupportHandoffErrorCodes = [
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'DUPLICATE_OR_ALREADY_APPLIED',
  'LIFECYCLE_CONFLICT',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND',
  'VALIDATION_FAILED',
] as const;

export type ExternalSupportHandoffErrorCode = (typeof externalSupportHandoffErrorCodes)[number];

export const externalSupportHandoffIntentKinds = [
  'initiate_support_privacy',
  'route_or_escalate',
  'external_handoff',
  'retry',
  'reconcile',
] as const;

export type ExternalSupportHandoffIntentKind = (typeof externalSupportHandoffIntentKinds)[number];
export type ExternalSupportHandoffFeedbackRole = 'status' | 'alert';
export type ExternalSupportHandoffFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface SupportRequestCategoryOption {
  readonly categoryReference: string;
  readonly label: string;
  readonly description: string;
}

export interface SupportRoutingOption {
  readonly optionReference: string;
  readonly label: string;
}

export interface MinimumRoutingFact {
  readonly factReference: string;
  readonly label: string;
  readonly value: string;
}

export interface ExternalSupportHandoffContext {
  readonly correlationReference: string;
  readonly minimumBusinessIntentReference: string;
  readonly purposeContext: string;
  readonly retryContext: string;
}

export interface ExternalSupportHandoffSnapshot {
  readonly boundedPrincipalContextReference: string;
  readonly requestCategoryOptions: readonly SupportRequestCategoryOption[];
  readonly selectedRequestCategoryReference?: string;
  readonly minimumRoutingFacts: readonly MinimumRoutingFact[];
  readonly consentPurposeContext?: string;
  readonly caseReference?: string;
  readonly routeStatusOptions: readonly SupportRoutingOption[];
  readonly selectedRouteStatusReference?: string;
  readonly structuredReasonOptions: readonly SupportRoutingOption[];
  readonly selectedStructuredReasonReference?: string;
  readonly minimumEvidenceReferences: readonly string[];
  readonly handoffContext?: ExternalSupportHandoffContext;
}

export type ExternalSupportHandoffVisibility = Readonly<
  Record<ExternalSupportHandoffIntentKind, boolean>
>;

export interface ExternalSupportHandoffCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly requestHeading: string;
  readonly requestCategoryLabel: string;
  readonly requestCategoryPlaceholder: string;
  readonly routingFactsHeading: string;
  readonly routingHeading: string;
  readonly routeStatusLabel: string;
  readonly routeStatusPlaceholder: string;
  readonly structuredReasonLabel: string;
  readonly structuredReasonPlaceholder: string;
  readonly evidenceHeading: string;
  readonly handoffHeading: string;
  readonly consequencesHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<ExternalSupportHandoffIntentKind, string>>;
  readonly feedback: Readonly<Record<ExternalSupportHandoffState, string>>;
}

export interface ExternalSupportHandoffContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly requestBody: string;
  readonly routingBody: string;
  readonly handoffBody: string;
  readonly localAcknowledgementConsequenceBody: string;
  readonly routedConsequenceBody: string;
  readonly handoffConsequenceBody: string;
  readonly durableFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type ExternalSupportHandoffIntent =
  | Readonly<{
      kind: 'initiate_support_privacy';
      boundedPrincipalContextReference: string;
      requestCategoryReference: string;
      minimumRoutingFactReferences: readonly string[];
      consentPurposeContext?: string;
    }>
  | Readonly<{
      kind: 'route_or_escalate';
      caseReference: string;
      routeStatusReference: string;
      minimumEvidenceReferences: readonly string[];
      structuredReasonReference: string;
    }>
  | Readonly<{
      kind: 'external_handoff';
      correlationReference: string;
      minimumBusinessIntentReference: string;
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
      caseReference: string;
      minimumEvidenceReferences: readonly string[];
    }>;

export interface ExternalSupportHandoffViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ExternalSupportHandoffState;
  readonly feedbackRole: ExternalSupportHandoffFeedbackRole;
  readonly feedbackTone: ExternalSupportHandoffFeedbackTone;
  readonly selectionEnabled: boolean;
  readonly visibleIntents: readonly ExternalSupportHandoffIntentKind[];
  readonly consequence: 'local' | 'routed' | 'handoff' | 'durable_final';
  readonly durableFinal: boolean;
  readonly opaqueReferences: Readonly<{
    boundedPrincipalContextReference: string;
    selectedRequestCategoryReference: string | undefined;
    caseReference: string | undefined;
    correlationReference: string | undefined;
    minimumRoutingFactReferences: readonly string[];
    minimumEvidenceReferences: readonly string[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info' },
  ready: { feedbackRole: 'status', feedbackTone: 'info' },
  empty: { feedbackRole: 'status', feedbackTone: 'info' },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger' },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger' },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger' },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning' },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning' },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning' },
  stale_or_conflicting_state: { feedbackRole: 'alert', feedbackTone: 'warning' },
  duplicate_or_already_applied: { feedbackRole: 'alert', feedbackTone: 'warning' },
  lifecycle_conflict: { feedbackRole: 'alert', feedbackTone: 'warning' },
  pending: { feedbackRole: 'status', feedbackTone: 'info' },
  local_acknowledgement: { feedbackRole: 'status', feedbackTone: 'info' },
  routed_or_escalated: { feedbackRole: 'status', feedbackTone: 'success' },
  external_handoff: { feedbackRole: 'status', feedbackTone: 'info' },
  recovery: { feedbackRole: 'status', feedbackTone: 'info' },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success' },
} as const satisfies Record<
  ExternalSupportHandoffState,
  {
    readonly feedbackRole: ExternalSupportHandoffFeedbackRole;
    readonly feedbackTone: ExternalSupportHandoffFeedbackTone;
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
  VALIDATION_FAILED: 'validation_error',
} as const satisfies Record<ExternalSupportHandoffErrorCode, ExternalSupportHandoffState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function hasSelectedOption(
  selectedReference: string | undefined,
  options: readonly { readonly optionReference?: string; readonly categoryReference?: string }[],
): selectedReference is string {
  return (
    hasValue(selectedReference) &&
    options.some(
      (option) =>
        option.optionReference === selectedReference ||
        option.categoryReference === selectedReference,
    )
  );
}

function hasInitiationContext(snapshot: ExternalSupportHandoffSnapshot): boolean {
  return (
    hasValue(snapshot.boundedPrincipalContextReference) &&
    hasSelectedOption(snapshot.selectedRequestCategoryReference, snapshot.requestCategoryOptions) &&
    snapshot.minimumRoutingFacts.length > 0
  );
}

function hasRoutingContext(snapshot: ExternalSupportHandoffSnapshot): boolean {
  return (
    hasValue(snapshot.caseReference) &&
    hasSelectedOption(snapshot.selectedRouteStatusReference, snapshot.routeStatusOptions) &&
    hasSelectedOption(
      snapshot.selectedStructuredReasonReference,
      snapshot.structuredReasonOptions,
    ) &&
    snapshot.minimumEvidenceReferences.length > 0
  );
}

function hasExternalContext(
  context: ExternalSupportHandoffContext | undefined,
): context is ExternalSupportHandoffContext {
  return (
    context !== undefined &&
    hasValue(context.correlationReference) &&
    hasValue(context.minimumBusinessIntentReference) &&
    hasValue(context.purposeContext) &&
    hasValue(context.retryContext)
  );
}

export function mapExternalSupportHandoffErrorCode(
  code: ExternalSupportHandoffErrorCode,
): ExternalSupportHandoffState {
  return stateByErrorCode[code];
}

export function isExternalSupportHandoffIntentEnabled(
  state: ExternalSupportHandoffState,
  kind: ExternalSupportHandoffIntentKind,
  snapshot: ExternalSupportHandoffSnapshot,
): boolean {
  if (kind === 'initiate_support_privacy') {
    return (state === 'ready' || state === 'validation_error') && hasInitiationContext(snapshot);
  }

  if (kind === 'route_or_escalate') {
    return (state === 'ready' || state === 'recovery') && hasRoutingContext(snapshot);
  }

  if (kind === 'external_handoff') {
    return (
      (state === 'routed_or_escalated' || state === 'recovery') &&
      hasExternalContext(snapshot.handoffContext)
    );
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      hasExternalContext(snapshot.handoffContext)
    );
  }

  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'duplicate_or_already_applied' ||
      state === 'lifecycle_conflict' ||
      state === 'recovery') &&
    hasValue(snapshot.caseReference) &&
    snapshot.minimumEvidenceReferences.length > 0
  );
}

export function createExternalSupportHandoffIntent(
  kind: ExternalSupportHandoffIntentKind,
  snapshot: ExternalSupportHandoffSnapshot,
): ExternalSupportHandoffIntent | undefined {
  if (
    kind === 'initiate_support_privacy' &&
    hasSelectedOption(snapshot.selectedRequestCategoryReference, snapshot.requestCategoryOptions) &&
    hasInitiationContext(snapshot)
  ) {
    return Object.freeze({
      kind,
      boundedPrincipalContextReference: snapshot.boundedPrincipalContextReference,
      requestCategoryReference: snapshot.selectedRequestCategoryReference,
      minimumRoutingFactReferences: Object.freeze(
        snapshot.minimumRoutingFacts.map((fact) => fact.factReference),
      ),
      ...(snapshot.consentPurposeContext === undefined
        ? {}
        : { consentPurposeContext: snapshot.consentPurposeContext }),
    });
  }

  if (
    kind === 'route_or_escalate' &&
    hasValue(snapshot.caseReference) &&
    hasSelectedOption(snapshot.selectedRouteStatusReference, snapshot.routeStatusOptions) &&
    hasSelectedOption(
      snapshot.selectedStructuredReasonReference,
      snapshot.structuredReasonOptions,
    ) &&
    hasRoutingContext(snapshot)
  ) {
    return Object.freeze({
      kind,
      caseReference: snapshot.caseReference,
      routeStatusReference: snapshot.selectedRouteStatusReference,
      minimumEvidenceReferences: Object.freeze([...snapshot.minimumEvidenceReferences]),
      structuredReasonReference: snapshot.selectedStructuredReasonReference,
    });
  }

  if (kind === 'external_handoff' && hasExternalContext(snapshot.handoffContext)) {
    return Object.freeze({ kind, ...snapshot.handoffContext });
  }

  if (kind === 'retry' && hasExternalContext(snapshot.handoffContext)) {
    return Object.freeze({
      kind,
      correlationReference: snapshot.handoffContext.correlationReference,
      retryContext: snapshot.handoffContext.retryContext,
    });
  }

  if (
    kind === 'reconcile' &&
    hasValue(snapshot.caseReference) &&
    snapshot.minimumEvidenceReferences.length > 0
  ) {
    return Object.freeze({
      kind,
      caseReference: snapshot.caseReference,
      minimumEvidenceReferences: Object.freeze([...snapshot.minimumEvidenceReferences]),
    });
  }

  return undefined;
}

export function getExternalSupportHandoffViewModel(
  locale: SupportedLocale,
  state: ExternalSupportHandoffState,
  snapshot: ExternalSupportHandoffSnapshot,
  visibility: ExternalSupportHandoffVisibility,
): ExternalSupportHandoffViewModel {
  const presentation = statePresentation[state];
  const consequence =
    state === 'durable_final'
      ? 'durable_final'
      : state === 'external_handoff'
        ? 'handoff'
        : state === 'routed_or_escalated'
          ? 'routed'
          : 'local';

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    selectionEnabled: state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(
      externalSupportHandoffIntentKinds.filter((kind) => visibility[kind]),
    ),
    consequence,
    durableFinal: state === 'durable_final',
    opaqueReferences: Object.freeze({
      boundedPrincipalContextReference: snapshot.boundedPrincipalContextReference,
      selectedRequestCategoryReference: snapshot.selectedRequestCategoryReference,
      caseReference: snapshot.caseReference,
      correlationReference: snapshot.handoffContext?.correlationReference,
      minimumRoutingFactReferences: Object.freeze(
        snapshot.minimumRoutingFacts.map((fact) => fact.factReference),
      ),
      minimumEvidenceReferences: Object.freeze([...snapshot.minimumEvidenceReferences]),
    }),
  };
}
