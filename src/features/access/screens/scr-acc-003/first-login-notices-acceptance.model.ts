import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const firstLoginNoticesAcceptanceStates = [
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
  'accepted_durable',
  'declined_durable',
] as const;

export type FirstLoginNoticesAcceptanceState = (typeof firstLoginNoticesAcceptanceStates)[number];

export const firstLoginNoticesErrorCodes = [
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

export type FirstLoginNoticesErrorCode = (typeof firstLoginNoticesErrorCodes)[number];
export type FirstLoginNoticesFeedbackRole = 'status' | 'alert';
export type FirstLoginNoticesFeedbackTone = 'info' | 'danger' | 'warning' | 'success';
export type FirstLoginNoticeResponse = 'accept' | 'decline';

export interface FirstLoginNotice {
  readonly noticeReference: string;
  readonly heading: string;
  readonly body: string;
}

export interface FirstLoginNoticesReferences {
  readonly principalReference: string;
  readonly disclosureVersionReference: string;
  readonly evidenceContext: string;
}

export interface FirstLoginNoticesAcceptanceCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly noticesHeading: string;
  readonly versionHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly responseLabels: Readonly<Record<FirstLoginNoticeResponse, string>>;
  readonly feedback: Readonly<Record<FirstLoginNoticesAcceptanceState, string>>;
}

export interface FirstLoginNoticesAcceptanceContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly consequenceBody: string;
  readonly helpBody: string;
  readonly notices: readonly FirstLoginNotice[];
}

export interface FirstLoginNoticeIntent extends FirstLoginNoticesReferences {
  readonly response: FirstLoginNoticeResponse;
}

export interface FirstLoginNoticesAcceptanceViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: FirstLoginNoticesAcceptanceState;
  readonly feedbackRole: FirstLoginNoticesFeedbackRole;
  readonly feedbackTone: FirstLoginNoticesFeedbackTone;
  readonly showNotices: boolean;
  readonly actionsEnabled: boolean;
  readonly durableOutcome: 'accepted' | 'declined' | undefined;
  readonly opaqueReferences: Readonly<FirstLoginNoticesReferences>;
}

const statePresentation = {
  loading: {
    feedbackRole: 'status',
    feedbackTone: 'info',
    showNotices: false,
    actionsEnabled: false,
  },
  ready: {
    feedbackRole: 'status',
    feedbackTone: 'info',
    showNotices: true,
    actionsEnabled: true,
  },
  empty: {
    feedbackRole: 'status',
    feedbackTone: 'info',
    showNotices: false,
    actionsEnabled: false,
  },
  validation_error: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showNotices: true,
    actionsEnabled: false,
  },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showNotices: false,
    actionsEnabled: false,
  },
  authority_denied: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showNotices: false,
    actionsEnabled: false,
  },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: false,
    actionsEnabled: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: false,
    actionsEnabled: false,
  },
  rate_limited: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: false,
    actionsEnabled: false,
  },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: true,
    actionsEnabled: false,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: true,
    actionsEnabled: false,
  },
  lifecycle_conflict: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: true,
    actionsEnabled: false,
  },
  pending: {
    feedbackRole: 'status',
    feedbackTone: 'info',
    showNotices: true,
    actionsEnabled: false,
  },
  recovery: {
    feedbackRole: 'status',
    feedbackTone: 'info',
    showNotices: true,
    actionsEnabled: false,
  },
  accepted_durable: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showNotices: true,
    actionsEnabled: false,
  },
  declined_durable: {
    feedbackRole: 'status',
    feedbackTone: 'info',
    showNotices: true,
    actionsEnabled: false,
  },
} as const satisfies Record<
  FirstLoginNoticesAcceptanceState,
  {
    readonly feedbackRole: FirstLoginNoticesFeedbackRole;
    readonly feedbackTone: FirstLoginNoticesFeedbackTone;
    readonly showNotices: boolean;
    readonly actionsEnabled: boolean;
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
} as const satisfies Record<FirstLoginNoticesErrorCode, FirstLoginNoticesAcceptanceState>;

export function mapFirstLoginNoticesErrorCode(
  code: FirstLoginNoticesErrorCode,
): FirstLoginNoticesAcceptanceState {
  return stateByErrorCode[code];
}

export function createFirstLoginNoticeIntent(
  response: FirstLoginNoticeResponse,
  references: FirstLoginNoticesReferences,
): FirstLoginNoticeIntent {
  return Object.freeze({ response, ...references });
}

export function getFirstLoginNoticesAcceptanceViewModel(
  locale: SupportedLocale,
  state: FirstLoginNoticesAcceptanceState,
  references: FirstLoginNoticesReferences,
): FirstLoginNoticesAcceptanceViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showNotices: presentation.showNotices,
    actionsEnabled: presentation.actionsEnabled,
    durableOutcome:
      state === 'accepted_durable'
        ? 'accepted'
        : state === 'declined_durable'
          ? 'declined'
          : undefined,
    opaqueReferences: Object.freeze({ ...references }),
  };
}
