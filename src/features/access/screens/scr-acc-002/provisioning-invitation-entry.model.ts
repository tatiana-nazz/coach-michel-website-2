import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const provisioningInvitationEntryStates = [
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

export type ProvisioningInvitationEntryState = (typeof provisioningInvitationEntryStates)[number];

export const provisioningInvitationErrorCodes = [
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

export type ProvisioningInvitationErrorCode = (typeof provisioningInvitationErrorCodes)[number];
export type ProvisioningFeedbackRole = 'status' | 'alert';
export type ProvisioningFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export const provisioningInvitationEntryFields = [
  'candidateReference',
  'invitationProvisioningEvidence',
  'subjectAccountGrantReference',
  'capabilityScopeDurationIntent',
  'reason',
  'approvalExceptionEvidence',
] as const;

export type ProvisioningInvitationEntryField = (typeof provisioningInvitationEntryFields)[number];

export const provisioningInvitationIntentKinds = ['provision', 'approve', 'retry'] as const;

export type ProvisioningInvitationIntentKind = (typeof provisioningInvitationIntentKinds)[number];

export interface ProvisioningInvitationEntryValues {
  readonly candidateReference: string;
  readonly invitationProvisioningEvidence: string;
  readonly subjectAccountGrantReference: string;
  readonly capabilityScopeDurationIntent: string;
  readonly reason: string;
  readonly approvalExceptionEvidence: string;
}

export interface ProvisioningInvitationEntryCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly primaryHeading: string;
  readonly disclosureHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly fieldLabels: Readonly<Record<ProvisioningInvitationEntryField, string>>;
  readonly fieldDescriptions: Readonly<Record<ProvisioningInvitationEntryField, string>>;
  readonly intentLabels: Readonly<Record<ProvisioningInvitationIntentKind, string>>;
  readonly feedback: Readonly<Record<ProvisioningInvitationEntryState, string>>;
}

export interface ProvisioningInvitationEntryContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly disclosureBody: string;
  readonly consequenceBody: string;
  readonly helpBody: string;
}

export interface ProvisioningInvitationIntent extends ProvisioningInvitationEntryValues {
  readonly kind: ProvisioningInvitationIntentKind;
}

export interface ProvisioningInvitationEntryViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ProvisioningInvitationEntryState;
  readonly feedbackRole: ProvisioningFeedbackRole;
  readonly feedbackTone: ProvisioningFeedbackTone;
  readonly showForm: boolean;
  readonly opaqueReferences: Readonly<{
    candidateReference: string;
    invitationProvisioningEvidence: string;
    subjectAccountGrantReference: string;
    approvalExceptionEvidence: string;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showForm: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showForm: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showForm: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showForm: true },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger', showForm: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showForm: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showForm: false,
  },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning', showForm: false },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showForm: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showForm: false,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showForm: false,
  },
  lifecycle_conflict: { feedbackRole: 'alert', feedbackTone: 'warning', showForm: false },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showForm: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showForm: true },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success', showForm: false },
} as const satisfies Record<
  ProvisioningInvitationEntryState,
  {
    readonly feedbackRole: ProvisioningFeedbackRole;
    readonly feedbackTone: ProvisioningFeedbackTone;
    readonly showForm: boolean;
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
} as const satisfies Record<ProvisioningInvitationErrorCode, ProvisioningInvitationEntryState>;

export function mapProvisioningInvitationErrorCode(
  code: ProvisioningInvitationErrorCode,
): ProvisioningInvitationEntryState {
  return stateByErrorCode[code];
}

export function isProvisioningIntentEnabled(
  state: ProvisioningInvitationEntryState,
  kind: ProvisioningInvitationIntentKind,
): boolean {
  if (kind === 'retry') {
    return state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery';
  }

  return state === 'ready' || state === 'validation_error';
}

export function createProvisioningInvitationIntent(
  kind: ProvisioningInvitationIntentKind,
  values: ProvisioningInvitationEntryValues,
): ProvisioningInvitationIntent {
  return Object.freeze({ kind, ...values });
}

export function getProvisioningInvitationEntryViewModel(
  locale: SupportedLocale,
  state: ProvisioningInvitationEntryState,
  values: ProvisioningInvitationEntryValues,
): ProvisioningInvitationEntryViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showForm: presentation.showForm,
    opaqueReferences: Object.freeze({
      candidateReference: values.candidateReference,
      invitationProvisioningEvidence: values.invitationProvisioningEvidence,
      subjectAccountGrantReference: values.subjectAccountGrantReference,
      approvalExceptionEvidence: values.approvalExceptionEvidence,
    }),
  };
}
