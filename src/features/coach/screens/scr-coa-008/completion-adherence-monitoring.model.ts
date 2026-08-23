import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const completionAdherenceMonitoringStates = [
  'loading',
  'ready',
  'empty',
  'validation_error',
  'authentication_required',
  'authority_denied',
  'resource_not_found',
  'resource_not_found_or_unavailable',
  'dependency_unavailable',
  'rate_limited',
  'stale_or_conflicting_state',
  'lifecycle_conflict',
  'duplicate_or_already_applied',
  'pending',
  'recovery',
  'authoritative_final',
] as const;

export type CompletionAdherenceMonitoringState =
  (typeof completionAdherenceMonitoringStates)[number];

export const completionAdherenceMonitoringErrorCodes = [
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'DUPLICATE_OR_ALREADY_APPLIED',
  'LIFECYCLE_CONFLICT',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
  'VALIDATION_FAILED',
] as const;

export type CompletionAdherenceMonitoringErrorCode =
  (typeof completionAdherenceMonitoringErrorCodes)[number];

export const completionAdherenceMonitoringIntentKinds = [
  'review_item',
  'refresh_monitoring',
  'request_projection_refresh_intent',
  'retry',
  'reconcile',
] as const;

export type CompletionAdherenceMonitoringIntentKind =
  (typeof completionAdherenceMonitoringIntentKinds)[number];
export type CompletionAdherenceMonitoringVisibility = Readonly<
  Record<CompletionAdherenceMonitoringIntentKind, boolean>
>;
export type CompletionAdherenceMonitoringFeedbackRole = 'status' | 'alert';
export type CompletionAdherenceMonitoringFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface CompletionAdherenceMonitoringOption {
  readonly optionReference: string;
  readonly label: string;
}

export interface CompletionAdherenceMonitoringItem {
  readonly orderingReference: string;
  readonly traineeReference: string;
  readonly scheduleReference: string;
  readonly completionReference?: string;
  readonly definitionVersionReference?: string;
  readonly evidenceReferences: readonly string[];
  readonly displayLabel: string;
  readonly scheduleStatusLabel: string;
  readonly completionStatusLabel: string;
  readonly adherenceStatusLabel: string;
  readonly authoritativeTimeLabel: string;
  readonly projectionStatusLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
}

export interface CompletionAdherenceMonitoringSnapshot {
  readonly monitoringReference: string;
  readonly authoritativeTimeContext: string;
  readonly projectionReference?: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly items: readonly CompletionAdherenceMonitoringItem[];
  readonly statusFilterOptions: readonly CompletionAdherenceMonitoringOption[];
  readonly selectedStatusFilterReference?: string;
  readonly sortOptions: readonly CompletionAdherenceMonitoringOption[];
  readonly selectedSortReference?: string;
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface CompletionAdherenceMonitoringCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly controlsHeading: string;
  readonly statusFilterLabel: string;
  readonly statusFilterPlaceholder: string;
  readonly sortLabel: string;
  readonly sortPlaceholder: string;
  readonly monitoringHeading: string;
  readonly evidenceHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<CompletionAdherenceMonitoringIntentKind, string>>;
  readonly feedback: Readonly<Record<CompletionAdherenceMonitoringState, string>>;
}

export interface CompletionAdherenceMonitoringContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly controlsBody: string;
  readonly monitoringBody: string;
  readonly evidenceBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type CompletionAdherenceMonitoringIntent =
  | Readonly<{
      kind: 'review_item';
      monitoringReference: string;
      traineeReference: string;
      scheduleReference: string;
      completionReference?: string;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'refresh_monitoring';
      monitoringReference: string;
      authoritativeTimeContext: string;
      selectedStatusFilterReference?: string;
      selectedSortReference?: string;
    }>
  | Readonly<{
      kind: 'request_projection_refresh_intent';
      monitoringReference: string;
      projectionReference: string;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{ kind: 'retry'; monitoringReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      monitoringReference: string;
      scheduleReferences: readonly string[];
      evidenceReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface CompletionAdherenceMonitoringViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: CompletionAdherenceMonitoringState;
  readonly feedbackRole: CompletionAdherenceMonitoringFeedbackRole;
  readonly feedbackTone: CompletionAdherenceMonitoringFeedbackTone;
  readonly showMonitoring: boolean;
  readonly controlsEnabled: boolean;
  readonly visibleIntents: readonly CompletionAdherenceMonitoringIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    monitoringReference: string;
    projectionReference: string | undefined;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    traineeReferences: readonly string[];
    scheduleReferences: readonly string[];
    completionReferences: readonly string[];
    definitionVersionReferences: readonly string[];
    evidenceReferences: readonly string[];
    orderingReferences: readonly string[];
    selectedStatusFilterReference: string | undefined;
    selectedSortReference: string | undefined;
  }>;
}

const statePresentation = {
  loading: { role: 'status', tone: 'info', show: false },
  ready: { role: 'status', tone: 'info', show: true },
  empty: { role: 'status', tone: 'info', show: false },
  validation_error: { role: 'alert', tone: 'danger', show: true },
  authentication_required: { role: 'alert', tone: 'danger', show: false },
  authority_denied: { role: 'alert', tone: 'danger', show: false },
  resource_not_found: { role: 'alert', tone: 'warning', show: false },
  resource_not_found_or_unavailable: { role: 'alert', tone: 'warning', show: false },
  dependency_unavailable: { role: 'alert', tone: 'warning', show: false },
  rate_limited: { role: 'alert', tone: 'warning', show: false },
  stale_or_conflicting_state: { role: 'alert', tone: 'warning', show: true },
  lifecycle_conflict: { role: 'alert', tone: 'warning', show: true },
  duplicate_or_already_applied: { role: 'alert', tone: 'warning', show: true },
  pending: { role: 'status', tone: 'info', show: true },
  recovery: { role: 'status', tone: 'info', show: true },
  authoritative_final: { role: 'status', tone: 'success', show: true },
} as const satisfies Record<
  CompletionAdherenceMonitoringState,
  {
    role: CompletionAdherenceMonitoringFeedbackRole;
    tone: CompletionAdherenceMonitoringFeedbackTone;
    show: boolean;
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
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
  VALIDATION_FAILED: 'validation_error',
} as const satisfies Record<
  CompletionAdherenceMonitoringErrorCode,
  CompletionAdherenceMonitoringState
>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function optionExists(
  selected: string | undefined,
  options: readonly CompletionAdherenceMonitoringOption[],
): boolean {
  return selected === undefined || options.some((option) => option.optionReference === selected);
}

function evidenceReferences(snapshot: CompletionAdherenceMonitoringSnapshot): readonly string[] {
  return Object.freeze(snapshot.items.flatMap((item) => [...item.evidenceReferences]));
}

export function mapCompletionAdherenceMonitoringErrorCode(
  code: CompletionAdherenceMonitoringErrorCode,
): CompletionAdherenceMonitoringState {
  return stateByErrorCode[code];
}

export function isCompletionAdherenceMonitoringIntentEnabled(
  state: CompletionAdherenceMonitoringState,
  kind: CompletionAdherenceMonitoringIntentKind,
  snapshot: CompletionAdherenceMonitoringSnapshot,
  item?: CompletionAdherenceMonitoringItem,
): boolean {
  const interactive = state === 'ready' || state === 'recovery';
  if (kind === 'review_item') return interactive && item?.reviewAvailable === true;
  if (kind === 'refresh_monitoring') {
    return (
      (interactive || state === 'empty') &&
      optionExists(snapshot.selectedStatusFilterReference, snapshot.statusFilterOptions) &&
      optionExists(snapshot.selectedSortReference, snapshot.sortOptions)
    );
  }
  if (kind === 'request_projection_refresh_intent') {
    return interactive && hasValue(snapshot.projectionReference);
  }
  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      hasValue(snapshot.retryContext)
    );
  }
  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'lifecycle_conflict' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    snapshot.items.length > 0 &&
    hasValue(snapshot.reconciliationContext)
  );
}

export function createCompletionAdherenceMonitoringIntent(
  kind: CompletionAdherenceMonitoringIntentKind,
  snapshot: CompletionAdherenceMonitoringSnapshot,
  item?: CompletionAdherenceMonitoringItem,
): CompletionAdherenceMonitoringIntent | undefined {
  if (kind === 'review_item' && item?.reviewAvailable === true) {
    return Object.freeze({
      kind,
      monitoringReference: snapshot.monitoringReference,
      traineeReference: item.traineeReference,
      scheduleReference: item.scheduleReference,
      ...(item.completionReference === undefined
        ? {}
        : { completionReference: item.completionReference }),
      evidenceReferences: Object.freeze([...item.evidenceReferences]),
    });
  }
  if (kind === 'refresh_monitoring') {
    return Object.freeze({
      kind,
      monitoringReference: snapshot.monitoringReference,
      authoritativeTimeContext: snapshot.authoritativeTimeContext,
      ...(snapshot.selectedStatusFilterReference === undefined
        ? {}
        : { selectedStatusFilterReference: snapshot.selectedStatusFilterReference }),
      ...(snapshot.selectedSortReference === undefined
        ? {}
        : { selectedSortReference: snapshot.selectedSortReference }),
    });
  }
  if (kind === 'request_projection_refresh_intent' && hasValue(snapshot.projectionReference)) {
    return Object.freeze({
      kind,
      monitoringReference: snapshot.monitoringReference,
      projectionReference: snapshot.projectionReference,
      evidenceReferences: evidenceReferences(snapshot),
    });
  }
  if (kind === 'retry' && hasValue(snapshot.retryContext)) {
    return Object.freeze({
      kind,
      monitoringReference: snapshot.monitoringReference,
      retryContext: snapshot.retryContext,
    });
  }
  if (kind === 'reconcile' && hasValue(snapshot.reconciliationContext)) {
    return Object.freeze({
      kind,
      monitoringReference: snapshot.monitoringReference,
      scheduleReferences: Object.freeze(snapshot.items.map((entry) => entry.scheduleReference)),
      evidenceReferences: evidenceReferences(snapshot),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getCompletionAdherenceMonitoringViewModel(
  locale: SupportedLocale,
  state: CompletionAdherenceMonitoringState,
  snapshot: CompletionAdherenceMonitoringSnapshot,
  visibility: CompletionAdherenceMonitoringVisibility,
): CompletionAdherenceMonitoringViewModel {
  const presentation = statePresentation[state];
  const consequence =
    state === 'authoritative_final'
      ? 'authoritative_final'
      : state === 'pending'
        ? 'pending'
        : 'local';
  return {
    locale,
    direction: directionForLocale(locale),
    state,
    feedbackRole: presentation.role,
    feedbackTone: presentation.tone,
    showMonitoring: presentation.show && snapshot.items.length > 0,
    controlsEnabled: state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(
      completionAdherenceMonitoringIntentKinds.filter((kind) => visibility[kind]),
    ),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      monitoringReference: snapshot.monitoringReference,
      projectionReference: snapshot.projectionReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      traineeReferences: Object.freeze(snapshot.items.map((item) => item.traineeReference)),
      scheduleReferences: Object.freeze(snapshot.items.map((item) => item.scheduleReference)),
      completionReferences: Object.freeze(
        snapshot.items.flatMap((item) =>
          item.completionReference === undefined ? [] : [item.completionReference],
        ),
      ),
      definitionVersionReferences: Object.freeze(
        snapshot.items.flatMap((item) =>
          item.definitionVersionReference === undefined ? [] : [item.definitionVersionReference],
        ),
      ),
      evidenceReferences: evidenceReferences(snapshot),
      orderingReferences: Object.freeze(snapshot.items.map((item) => item.orderingReference)),
      selectedStatusFilterReference: snapshot.selectedStatusFilterReference,
      selectedSortReference: snapshot.selectedSortReference,
    }),
  };
}
