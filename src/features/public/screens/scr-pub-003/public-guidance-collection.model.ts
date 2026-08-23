import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const publicGuidanceCollectionStates = [
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

export type PublicGuidanceCollectionState = (typeof publicGuidanceCollectionStates)[number];

export const publicGuidanceCollectionErrorCodes = [
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type PublicGuidanceCollectionErrorCode = (typeof publicGuidanceCollectionErrorCodes)[number];

export type PublicGuidanceCollectionFeedbackRole = 'status' | 'alert';
export type PublicGuidanceCollectionFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface PublicGuidancePresentationItem {
  readonly heading: string;
  readonly body: string;
  readonly reference?: string;
}

export interface PublicGuidanceCollectionCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly contextHeading: string;
  readonly primaryHeading: string;
  readonly supportingHeading: string;
  readonly disclosureHeading: string;
  readonly helpHeading: string;
  readonly feedbackHeading: string;
  readonly feedback: Readonly<Record<PublicGuidanceCollectionState, string>>;
}

export interface PublicGuidanceCollectionContent {
  readonly contextBody: string;
  readonly items: readonly PublicGuidancePresentationItem[];
  readonly supportingBody: string;
  readonly disclosureBody: string;
  readonly helpBody: string;
  readonly approvedContentContext?: string;
}

export interface PublicGuidanceCollectionViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: PublicGuidanceCollectionState;
  readonly feedbackRole: PublicGuidanceCollectionFeedbackRole;
  readonly feedbackTone: PublicGuidanceCollectionFeedbackTone;
  readonly showCollection: boolean;
  readonly opaqueReferences: Readonly<{
    approvedContentContext: string | undefined;
    itemReferences: readonly (string | undefined)[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showCollection: false },
  ready: { feedbackRole: 'status', feedbackTone: 'success', showCollection: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showCollection: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showCollection: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCollection: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCollection: false,
  },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showCollection: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCollection: false,
  },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showCollection: false },
} as const satisfies Record<
  PublicGuidanceCollectionState,
  {
    readonly feedbackRole: PublicGuidanceCollectionFeedbackRole;
    readonly feedbackTone: PublicGuidanceCollectionFeedbackTone;
    readonly showCollection: boolean;
  }
>;

const stateByErrorCode = {
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<PublicGuidanceCollectionErrorCode, PublicGuidanceCollectionState>;

export function mapPublicGuidanceCollectionErrorCode(
  code: PublicGuidanceCollectionErrorCode,
): PublicGuidanceCollectionState {
  return stateByErrorCode[code];
}

export function getPublicGuidanceCollectionViewModel(
  locale: SupportedLocale,
  state: PublicGuidanceCollectionState,
  content?: Pick<PublicGuidanceCollectionContent, 'approvedContentContext' | 'items'>,
): PublicGuidanceCollectionViewModel {
  const presentation = statePresentation[state];
  const itemReferences = content?.items.map((item) => item.reference) ?? [];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showCollection: presentation.showCollection && (content?.items.length ?? 0) > 0,
    opaqueReferences: Object.freeze({
      approvedContentContext: content?.approvedContentContext,
      itemReferences: Object.freeze(itemReferences),
    }),
  };
}
