import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const publicOverviewStates = [
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

export type PublicOverviewState = (typeof publicOverviewStates)[number];

export const publicOverviewErrorCodes = [
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type PublicOverviewErrorCode = (typeof publicOverviewErrorCodes)[number];

export type PublicOverviewFeedbackRole = 'status' | 'alert';
export type PublicOverviewFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface PublicOverviewCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly identityHeading: string;
  readonly identityBody: string;
  readonly publicBoundaryHeading: string;
  readonly publicBoundaryBody: string;
  readonly primaryHeading: string;
  readonly audienceHeading: string;
  readonly supportingHeading: string;
  readonly disclosureHeading: string;
  readonly disclosureBody: string;
  readonly helpHeading: string;
  readonly helpBody: string;
  readonly feedbackHeading: string;
  readonly feedback: Readonly<Record<PublicOverviewState, string>>;
}

export interface PublicOverviewContent {
  readonly purposeBody: string;
  readonly audienceBody: string;
  readonly supportingBody: string;
  readonly approvedContentContext?: string;
  readonly reference?: string;
}

export interface PublicOverviewViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: PublicOverviewState;
  readonly feedbackRole: PublicOverviewFeedbackRole;
  readonly feedbackTone: PublicOverviewFeedbackTone;
  readonly showInformation: boolean;
  readonly opaqueReferences: Readonly<{
    approvedContentContext: string | undefined;
    reference: string | undefined;
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
  PublicOverviewState,
  {
    readonly feedbackRole: PublicOverviewFeedbackRole;
    readonly feedbackTone: PublicOverviewFeedbackTone;
    readonly showInformation: boolean;
  }
>;

const stateByErrorCode = {
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<PublicOverviewErrorCode, PublicOverviewState>;

export function mapPublicOverviewErrorCode(code: PublicOverviewErrorCode): PublicOverviewState {
  return stateByErrorCode[code];
}

export function getPublicOverviewViewModel(
  locale: SupportedLocale,
  state: PublicOverviewState,
  content?: Pick<PublicOverviewContent, 'approvedContentContext' | 'reference'>,
): PublicOverviewViewModel {
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
      reference: content?.reference,
    }),
  };
}
