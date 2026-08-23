import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const publicDisclosuresStates = [
  'loading',
  'ready',
  'empty',
  'authentication_required',
  'authority_denied',
  'resource_not_found_or_unavailable',
  'dependency_unavailable',
  'rate_limited',
  'stale_or_conflicting_state',
  'recovery',
] as const;

export type PublicDisclosuresState = (typeof publicDisclosuresStates)[number];

export const publicDisclosuresErrorCodes = [
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type PublicDisclosuresErrorCode = (typeof publicDisclosuresErrorCodes)[number];

export type PublicDisclosuresFeedbackRole = 'status' | 'alert';
export type PublicDisclosuresFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface PublicDisclosuresCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly contextHeading: string;
  readonly primaryHeading: string;
  readonly supportingHeading: string;
  readonly disclosureHeading: string;
  readonly helpHeading: string;
  readonly feedbackHeading: string;
  readonly feedback: Readonly<Record<PublicDisclosuresState, string>>;
}

export interface PublicDisclosuresContent {
  readonly contextBody: string;
  readonly primaryBody: string;
  readonly supportingBody: string;
  readonly disclosureBody: string;
  readonly helpBody: string;
  readonly evidenceContext?: string;
}

export interface PublicDisclosuresViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: PublicDisclosuresState;
  readonly feedbackRole: PublicDisclosuresFeedbackRole;
  readonly feedbackTone: PublicDisclosuresFeedbackTone;
  readonly showInformation: boolean;
  readonly opaqueReferences: Readonly<{
    evidenceContext: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showInformation: false },
  ready: { feedbackRole: 'status', feedbackTone: 'success', showInformation: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showInformation: false },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showInformation: false,
  },
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
  PublicDisclosuresState,
  {
    readonly feedbackRole: PublicDisclosuresFeedbackRole;
    readonly feedbackTone: PublicDisclosuresFeedbackTone;
    readonly showInformation: boolean;
  }
>;

const stateByErrorCode = {
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<PublicDisclosuresErrorCode, PublicDisclosuresState>;

export function mapPublicDisclosuresErrorCode(code: PublicDisclosuresErrorCode): PublicDisclosuresState {
  return stateByErrorCode[code];
}

export function getPublicDisclosuresViewModel(
  locale: SupportedLocale,
  state: PublicDisclosuresState,
  content?: Pick<PublicDisclosuresContent, 'evidenceContext'>,
): PublicDisclosuresViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showInformation: presentation.showInformation,
    opaqueReferences: Object.freeze({
      evidenceContext: content?.evidenceContext,
    }),
  };
}
