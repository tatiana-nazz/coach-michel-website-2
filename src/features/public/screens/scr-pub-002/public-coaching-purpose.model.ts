import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const publicCoachingPurposeStates = [
  'loading',
  'ready',
  'empty',
  'authority_denied',
  'resource_not_found_or_unavailable',
  'dependency_unavailable',
  'rate_limited',
  'stale_or_conflicting_state',
  'recovery',
] as const;

export type PublicCoachingPurposeState = (typeof publicCoachingPurposeStates)[number];

export const publicCoachingPurposeErrorCodes = [
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type PublicCoachingPurposeErrorCode = (typeof publicCoachingPurposeErrorCodes)[number];

export type PublicCoachingPurposeFeedbackRole = 'status' | 'alert';
export type PublicCoachingPurposeFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface PublicCoachingPurposeCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly contextHeading: string;
  readonly primaryHeading: string;
  readonly supportingHeading: string;
  readonly disclosureHeading: string;
  readonly helpHeading: string;
  readonly feedbackHeading: string;
  readonly feedback: Readonly<Record<PublicCoachingPurposeState, string>>;
}

export interface PublicCoachingPurposeContent {
  readonly contextBody: string;
  readonly primaryBody: string;
  readonly supportingBody: string;
  readonly disclosureBody: string;
  readonly helpBody: string;
  readonly approvedContentContext?: string;
}

export interface PublicCoachingPurposeViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: PublicCoachingPurposeState;
  readonly feedbackRole: PublicCoachingPurposeFeedbackRole;
  readonly feedbackTone: PublicCoachingPurposeFeedbackTone;
  readonly showInformation: boolean;
  readonly opaqueReferences: Readonly<{
    approvedContentContext: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showInformation: false },
  ready: { feedbackRole: 'status', feedbackTone: 'success', showInformation: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showInformation: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showInformation: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showInformation: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showInformation: false,
  },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showInformation: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showInformation: false,
  },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showInformation: false },
} as const satisfies Record<
  PublicCoachingPurposeState,
  {
    readonly feedbackRole: PublicCoachingPurposeFeedbackRole;
    readonly feedbackTone: PublicCoachingPurposeFeedbackTone;
    readonly showInformation: boolean;
  }
>;

const stateByErrorCode = {
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<PublicCoachingPurposeErrorCode, PublicCoachingPurposeState>;

export function mapPublicCoachingPurposeErrorCode(
  code: PublicCoachingPurposeErrorCode,
): PublicCoachingPurposeState {
  return stateByErrorCode[code];
}

export function getPublicCoachingPurposeViewModel(
  locale: SupportedLocale,
  state: PublicCoachingPurposeState,
  content?: Pick<PublicCoachingPurposeContent, 'approvedContentContext'>,
): PublicCoachingPurposeViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showInformation: presentation.showInformation,
    opaqueReferences: Object.freeze({
      approvedContentContext: content?.approvedContentContext,
    }),
  };
}
