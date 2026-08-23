import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const accountLanguageNoticesStates = [
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
  'pending',
  'recovery',
  'authoritative_final',
] as const;

export type AccountLanguageNoticesState = (typeof accountLanguageNoticesStates)[number];

export const accountLanguageNoticesErrorCodes = [
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type AccountLanguageNoticesErrorCode = (typeof accountLanguageNoticesErrorCodes)[number];

export const accountLanguageNoticesIntentKinds = ['refresh_notices', 'retry', 'reconcile'] as const;

export type AccountLanguageNoticesIntentKind = (typeof accountLanguageNoticesIntentKinds)[number];
export type AccountLanguageNoticesFeedbackRole = 'status' | 'alert';
export type AccountLanguageNoticesFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface AccountLanguageNotice {
  readonly noticeReference: string;
  readonly heading: string;
  readonly body: string;
  readonly effectiveReference?: string;
}

export interface AccountLanguageNoticesSnapshot {
  readonly accountReference: string;
  readonly boundedPrincipalContext?: string;
  readonly audienceContext?: string;
  readonly effectiveTimeContext?: string;
  readonly authorityStatusReference: string;
  readonly notices: readonly AccountLanguageNotice[];
  readonly retryContext?: string;
}

export interface AccountLanguageNoticesPresentationOption {
  readonly locale: SupportedLocale;
  readonly label: string;
}

export type AccountLanguageNoticesVisibility = Readonly<
  Record<AccountLanguageNoticesIntentKind, boolean>
>;

export interface AccountLanguageNoticesCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly accountHeading: string;
  readonly authorityHeading: string;
  readonly languageHeading: string;
  readonly languageLabel: string;
  readonly noticesHeading: string;
  readonly consequencesHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<AccountLanguageNoticesIntentKind, string>>;
  readonly feedback: Readonly<Record<AccountLanguageNoticesState, string>>;
}

export interface AccountLanguageNoticesContent {
  readonly contextBody: string;
  readonly accountBody: string;
  readonly authorityBody: string;
  readonly languageBody: string;
  readonly localConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type AccountLanguageNoticesIntent =
  | Readonly<{
      kind: 'refresh_notices';
      accountReference: string;
      audienceContext?: string;
      effectiveTimeContext?: string;
    }>
  | Readonly<{
      kind: 'retry';
      accountReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      accountReference: string;
      noticeReferences: readonly string[];
    }>;

export interface AccountLanguageNoticesViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: AccountLanguageNoticesState;
  readonly feedbackRole: AccountLanguageNoticesFeedbackRole;
  readonly feedbackTone: AccountLanguageNoticesFeedbackTone;
  readonly showNotices: boolean;
  readonly presentationSelectionEnabled: boolean;
  readonly visibleIntents: readonly AccountLanguageNoticesIntentKind[];
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    accountReference: string;
    authorityStatusReference: string;
    noticeReferences: readonly string[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showNotices: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showNotices: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showNotices: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showNotices: true },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showNotices: false,
  },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showNotices: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: false,
  },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showNotices: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: true,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showNotices: true,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showNotices: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showNotices: true },
  authoritative_final: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showNotices: true,
  },
} as const satisfies Record<
  AccountLanguageNoticesState,
  {
    readonly feedbackRole: AccountLanguageNoticesFeedbackRole;
    readonly feedbackTone: AccountLanguageNoticesFeedbackTone;
    readonly showNotices: boolean;
  }
>;

const stateByErrorCode = {
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<AccountLanguageNoticesErrorCode, AccountLanguageNoticesState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

export function mapAccountLanguageNoticesErrorCode(
  code: AccountLanguageNoticesErrorCode,
): AccountLanguageNoticesState {
  return stateByErrorCode[code];
}

export function isAccountLanguageNoticesIntentEnabled(
  state: AccountLanguageNoticesState,
  kind: AccountLanguageNoticesIntentKind,
  snapshot: AccountLanguageNoticesSnapshot,
): boolean {
  if (kind === 'refresh_notices') {
    return state === 'ready' || state === 'empty' || state === 'recovery';
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      hasValue(snapshot.retryContext)
    );
  }

  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    snapshot.notices.length > 0
  );
}

export function createAccountLanguageNoticesIntent(
  kind: AccountLanguageNoticesIntentKind,
  snapshot: AccountLanguageNoticesSnapshot,
): AccountLanguageNoticesIntent | undefined {
  if (kind === 'refresh_notices') {
    return Object.freeze({
      kind,
      accountReference: snapshot.accountReference,
      ...(snapshot.audienceContext === undefined
        ? {}
        : { audienceContext: snapshot.audienceContext }),
      ...(snapshot.effectiveTimeContext === undefined
        ? {}
        : { effectiveTimeContext: snapshot.effectiveTimeContext }),
    });
  }

  if (kind === 'retry' && hasValue(snapshot.retryContext)) {
    return Object.freeze({
      kind,
      accountReference: snapshot.accountReference,
      retryContext: snapshot.retryContext,
    });
  }

  if (kind === 'reconcile' && snapshot.notices.length > 0) {
    return Object.freeze({
      kind,
      accountReference: snapshot.accountReference,
      noticeReferences: Object.freeze(snapshot.notices.map((notice) => notice.noticeReference)),
    });
  }

  return undefined;
}

export function getAccountLanguageNoticesViewModel(
  locale: SupportedLocale,
  state: AccountLanguageNoticesState,
  snapshot: AccountLanguageNoticesSnapshot,
  visibility: AccountLanguageNoticesVisibility,
): AccountLanguageNoticesViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showNotices: presentation.showNotices && snapshot.notices.length > 0,
    presentationSelectionEnabled:
      state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(
      accountLanguageNoticesIntentKinds.filter((kind) => visibility[kind]),
    ),
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      accountReference: snapshot.accountReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      noticeReferences: Object.freeze(snapshot.notices.map((notice) => notice.noticeReference)),
    }),
  };
}
