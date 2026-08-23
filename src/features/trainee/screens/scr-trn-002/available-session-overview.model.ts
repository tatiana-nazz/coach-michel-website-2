import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const availableSessionOverviewStates = [
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
  'pending',
  'recovery',
  'durable_final',
] as const;

export type AvailableSessionOverviewState = (typeof availableSessionOverviewStates)[number];

export const availableSessionOverviewErrorCodes = [
  'VALIDATION_FAILED',
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type AvailableSessionOverviewErrorCode = (typeof availableSessionOverviewErrorCodes)[number];

export const availableSessionOverviewIntentKinds = [
  'request_approved_work',
  'retry',
  'reconcile',
] as const;

export type AvailableSessionOverviewIntentKind =
  (typeof availableSessionOverviewIntentKinds)[number];
export type AvailableSessionOverviewFeedbackRole = 'status' | 'alert';
export type AvailableSessionOverviewFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface AvailableSessionWorkItem {
  readonly workReference: string;
  readonly heading: string;
  readonly description: string;
  readonly statusLabel: string;
  readonly availableForIntent: boolean;
}

export interface AvailableSessionSnapshot {
  readonly sessionReference: string;
  readonly sessionHeading: string;
  readonly sessionStatus: string;
  readonly sessionSummary: string;
  readonly approvedWork: readonly AvailableSessionWorkItem[];
}

export interface AvailableSessionRecoveryContext {
  readonly retryContext: string;
  readonly reconciliationContext: string;
}

export type AvailableSessionOverviewVisibility = Readonly<
  Record<AvailableSessionOverviewIntentKind, boolean>
>;

export interface AvailableSessionOverviewCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly sessionHeading: string;
  readonly workHeading: string;
  readonly workLegend: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<AvailableSessionOverviewIntentKind, string>>;
  readonly feedback: Readonly<Record<AvailableSessionOverviewState, string>>;
}

export interface AvailableSessionOverviewContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly localConsequenceBody: string;
  readonly durableFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type AvailableSessionOverviewIntent =
  | Readonly<{
      kind: 'request_approved_work';
      sessionReference: string;
      workReference: string;
    }>
  | Readonly<{
      kind: 'retry';
      sessionReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      sessionReference: string;
      reconciliationContext: string;
    }>;

export interface AvailableSessionOverviewViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: AvailableSessionOverviewState;
  readonly feedbackRole: AvailableSessionOverviewFeedbackRole;
  readonly feedbackTone: AvailableSessionOverviewFeedbackTone;
  readonly showSession: boolean;
  readonly selectionEnabled: boolean;
  readonly durableFinal: boolean;
  readonly visibleIntents: readonly AvailableSessionOverviewIntentKind[];
  readonly opaqueReferences: Readonly<{
    sessionReference: string;
    selectedWorkReference: string | undefined;
    workReferences: readonly string[];
    retryContext: string | undefined;
    reconciliationContext: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showSession: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showSession: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showSession: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showSession: true },
  authentication_required: { feedbackRole: 'alert', feedbackTone: 'danger', showSession: false },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showSession: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSession: false,
  },
  dependency_unavailable: { feedbackRole: 'alert', feedbackTone: 'warning', showSession: false },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showSession: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSession: false,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showSession: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showSession: true },
  durable_final: { feedbackRole: 'status', feedbackTone: 'success', showSession: true },
} as const satisfies Record<
  AvailableSessionOverviewState,
  {
    readonly feedbackRole: AvailableSessionOverviewFeedbackRole;
    readonly feedbackTone: AvailableSessionOverviewFeedbackTone;
    readonly showSession: boolean;
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
} as const satisfies Record<AvailableSessionOverviewErrorCode, AvailableSessionOverviewState>;

export function mapAvailableSessionOverviewErrorCode(
  code: AvailableSessionOverviewErrorCode,
): AvailableSessionOverviewState {
  return stateByErrorCode[code];
}

export function isAvailableSessionOverviewIntentEnabled(
  state: AvailableSessionOverviewState,
  kind: AvailableSessionOverviewIntentKind,
  selectedWork: AvailableSessionWorkItem | undefined,
  recoveryContext: AvailableSessionRecoveryContext | undefined,
): boolean {
  if (kind === 'request_approved_work') {
    return state === 'ready' && selectedWork?.availableForIntent === true;
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      recoveryContext !== undefined
    );
  }

  return (
    (state === 'stale_or_conflicting_state' || state === 'recovery') &&
    recoveryContext !== undefined
  );
}

export function createAvailableSessionOverviewIntent(
  kind: AvailableSessionOverviewIntentKind,
  snapshot: AvailableSessionSnapshot,
  selectedWork: AvailableSessionWorkItem | undefined,
  recoveryContext: AvailableSessionRecoveryContext | undefined,
): AvailableSessionOverviewIntent | undefined {
  if (kind === 'request_approved_work' && selectedWork !== undefined) {
    return Object.freeze({
      kind,
      sessionReference: snapshot.sessionReference,
      workReference: selectedWork.workReference,
    });
  }

  if (kind === 'retry' && recoveryContext !== undefined) {
    return Object.freeze({
      kind,
      sessionReference: snapshot.sessionReference,
      retryContext: recoveryContext.retryContext,
    });
  }

  if (kind === 'reconcile' && recoveryContext !== undefined) {
    return Object.freeze({
      kind,
      sessionReference: snapshot.sessionReference,
      reconciliationContext: recoveryContext.reconciliationContext,
    });
  }

  return undefined;
}

export function getAvailableSessionOverviewViewModel(
  locale: SupportedLocale,
  state: AvailableSessionOverviewState,
  snapshot: AvailableSessionSnapshot,
  selectedWorkReference: string | undefined,
  visibility: AvailableSessionOverviewVisibility,
  recoveryContext?: AvailableSessionRecoveryContext,
): AvailableSessionOverviewViewModel {
  const presentation = statePresentation[state];

  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showSession: presentation.showSession,
    selectionEnabled: state === 'ready' || state === 'validation_error',
    durableFinal: state === 'durable_final',
    visibleIntents: Object.freeze(
      availableSessionOverviewIntentKinds.filter((kind) => visibility[kind]),
    ),
    opaqueReferences: Object.freeze({
      sessionReference: snapshot.sessionReference,
      selectedWorkReference,
      workReferences: Object.freeze(snapshot.approvedWork.map((item) => item.workReference)),
      retryContext: recoveryContext?.retryContext,
      reconciliationContext: recoveryContext?.reconciliationContext,
    }),
  };
}
