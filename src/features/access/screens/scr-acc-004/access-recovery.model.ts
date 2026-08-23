import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const accessRecoveryStates = [
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
  'lifecycle_conflict',
  'pending',
  'recovery',
  'durable_final',
] as const;

export type AccessRecoveryState = (typeof accessRecoveryStates)[number];

export const accessRecoveryErrorCodes = [
  'VALIDATION_FAILED',
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'STALE_OR_CONFLICTING_STATE',
  'DUPLICATE_OR_ALREADY_APPLIED',
  'LIFECYCLE_CONFLICT',
] as const;

export type AccessRecoveryErrorCode = (typeof accessRecoveryErrorCodes)[number];
export type AccessRecoveryFeedbackRole = 'status' | 'alert';
export type AccessRecoveryFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export const accessRecoveryFields = [
  'minimumRecoveryLocatorEvidence',
  'requestedRecoveryPurpose',
] as const;

export type AccessRecoveryField = (typeof accessRecoveryFields)[number];
export type AccessRecoveryIntentKind = 'initiate' | 'retry' | 'external_handoff';

export interface AccessRecoveryValues {
  readonly minimumRecoveryLocatorEvidence: string;
  readonly requestedRecoveryPurpose: string;
}

export interface AccessRecoveryAuthorityContext {
  readonly antiAbuseContext: string;
  readonly principalAdminAuthorityContext?: string;
}

export interface AccessRecoveryReferences {
  readonly recoveryReference?: string;
  readonly externalHandoffCorrelationReference?: string;
}

export interface AccessRecoveryCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly primaryHeading: string;
  readonly recoveryReferenceHeading: string;
  readonly consequenceHeading: string;
  readonly externalHandoffHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly fieldLabels: Readonly<Record<AccessRecoveryField, string>>;
  readonly fieldDescriptions: Readonly<Record<AccessRecoveryField, string>>;
  readonly intentLabels: Readonly<Record<AccessRecoveryIntentKind, string>>;
  readonly feedback: Readonly<Record<AccessRecoveryState, string>>;
}

export interface AccessRecoveryContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly consequenceBody: string;
  readonly externalHandoffBody: string;
  readonly helpBody: string;
}

export interface AccessRecoveryIntent extends AccessRecoveryValues, AccessRecoveryReferences {
  readonly kind: AccessRecoveryIntentKind;
}

export interface AccessRecoveryViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: AccessRecoveryState;
  readonly feedbackRole: AccessRecoveryFeedbackRole;
  readonly feedbackTone: AccessRecoveryFeedbackTone;
  readonly showInputs: boolean;
  readonly opaqueReferences: Readonly<{
    minimumRecoveryLocatorEvidence: string;
    antiAbuseContext: string;
    principalAdminAuthorityContext: string | undefined;
    recoveryReference: string | undefined;
    externalHandoffCorrelationReference: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showInputs: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showInputs: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showInputs: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showInputs: true },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger', showInputs: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showInputs: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showInputs: false,
  },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning', showInputs: false },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showInputs: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showInputs: false,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showInputs: false,
  },
  lifecycle_conflict: { feedbackRole: 'alert', feedbackTone: 'warning', showInputs: false },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showInputs: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showInputs: true },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success', showInputs: false },
} as const satisfies Record<
  AccessRecoveryState,
  {
    readonly feedbackRole: AccessRecoveryFeedbackRole;
    readonly feedbackTone: AccessRecoveryFeedbackTone;
    readonly showInputs: boolean;
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
  DUPLICATE_OR_ALREADY_APPLIED: 'duplicate_or_already_applied',
  LIFECYCLE_CONFLICT: 'lifecycle_conflict',
} as const satisfies Record<AccessRecoveryErrorCode, AccessRecoveryState>;

export function mapAccessRecoveryErrorCode(code: AccessRecoveryErrorCode): AccessRecoveryState {
  return stateByErrorCode[code];
}

export function isAccessRecoveryIntentEnabled(
  state: AccessRecoveryState,
  kind: AccessRecoveryIntentKind,
): boolean {
  if (kind === 'retry') {
    return state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery';
  }

  if (kind === 'external_handoff') {
    return state === 'recovery';
  }

  return state === 'ready' || state === 'validation_error';
}

export function createAccessRecoveryIntent(
  kind: AccessRecoveryIntentKind,
  values: AccessRecoveryValues,
  references: AccessRecoveryReferences,
): AccessRecoveryIntent {
  return Object.freeze({ kind, ...values, ...references });
}

export function getAccessRecoveryViewModel(
  locale: SupportedLocale,
  state: AccessRecoveryState,
  values: AccessRecoveryValues,
  authorityContext: AccessRecoveryAuthorityContext,
  references: AccessRecoveryReferences,
): AccessRecoveryViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showInputs: presentation.showInputs,
    opaqueReferences: Object.freeze({
      minimumRecoveryLocatorEvidence: values.minimumRecoveryLocatorEvidence,
      antiAbuseContext: authorityContext.antiAbuseContext,
      principalAdminAuthorityContext: authorityContext.principalAdminAuthorityContext,
      recoveryReference: references.recoveryReference,
      externalHandoffCorrelationReference: references.externalHandoffCorrelationReference,
    }),
  };
}
