import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const coachOverviewStates = [
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
  'duplicate_or_already_applied',
  'lifecycle_conflict',
  'pending',
  'recovery',
  'authoritative_final',
] as const;

export type CoachOverviewState = (typeof coachOverviewStates)[number];

export const coachOverviewErrorCodes = [
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

export type CoachOverviewErrorCode = (typeof coachOverviewErrorCodes)[number];

export const coachOverviewIntentKinds = [
  'review_summary',
  'refresh_overview',
  'request_projection_reconciliation',
  'retry',
] as const;

export type CoachOverviewIntentKind = (typeof coachOverviewIntentKinds)[number];
export type CoachOverviewFeedbackRole = 'status' | 'alert';
export type CoachOverviewFeedbackTone = 'info' | 'danger' | 'warning' | 'success';
export type CoachOverviewSummaryCategory = 'planning' | 'release' | 'monitoring' | 'exception';

export interface CoachOverviewSummary {
  readonly summaryReference: string;
  readonly category: CoachOverviewSummaryCategory;
  readonly heading: string;
  readonly statusLabel: string;
  readonly body: string;
  readonly nextActionLabel: string;
  readonly reviewAvailable: boolean;
}

export interface CoachOverviewFilterOption {
  readonly filterReference: string;
  readonly label: string;
}

export interface CoachOverviewProjectionContext {
  readonly affectedProjectionReference: string;
  readonly sourceEvidenceReferences: readonly string[];
  readonly retryContext: string;
}

export interface CoachOverviewSnapshot {
  readonly overviewStatusReference: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly summaries: readonly CoachOverviewSummary[];
  readonly timeWindowContext?: string;
  readonly filterOptions: readonly CoachOverviewFilterOption[];
  readonly selectedFilterReferences: readonly string[];
  readonly projectionContext?: CoachOverviewProjectionContext;
}

export type CoachOverviewVisibility = Readonly<Record<CoachOverviewIntentKind, boolean>>;

export interface CoachOverviewCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly filtersHeading: string;
  readonly filtersLegend: string;
  readonly summariesHeading: string;
  readonly projectionHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<CoachOverviewIntentKind, string>>;
  readonly feedback: Readonly<Record<CoachOverviewState, string>>;
}

export interface CoachOverviewContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly filtersBody: string;
  readonly projectionBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type CoachOverviewIntent =
  | Readonly<{
      kind: 'review_summary';
      summaryReference: string;
      category: CoachOverviewSummaryCategory;
    }>
  | Readonly<{
      kind: 'refresh_overview';
      selectedFilterReferences: readonly string[];
      timeWindowContext?: string;
    }>
  | Readonly<{
      kind: 'request_projection_reconciliation';
      affectedProjectionReference: string;
      sourceEvidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'retry';
      affectedProjectionReference: string;
      retryContext: string;
    }>;

export interface CoachOverviewViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: CoachOverviewState;
  readonly feedbackRole: CoachOverviewFeedbackRole;
  readonly feedbackTone: CoachOverviewFeedbackTone;
  readonly showSummaries: boolean;
  readonly filterSelectionEnabled: boolean;
  readonly visibleIntents: readonly CoachOverviewIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    overviewStatusReference: string;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    summaryReferences: readonly string[];
    selectedFilterReferences: readonly string[];
    affectedProjectionReference: string | undefined;
    sourceEvidenceReferences: readonly string[];
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showSummaries: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showSummaries: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showSummaries: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showSummaries: true },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showSummaries: false,
  },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showSummaries: false },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showSummaries: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSummaries: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSummaries: false,
  },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showSummaries: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSummaries: true,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showSummaries: true,
  },
  lifecycle_conflict: { feedbackRole: 'alert', feedbackTone: 'warning', showSummaries: true },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showSummaries: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showSummaries: true },
  authoritative_final: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showSummaries: true,
  },
} as const satisfies Record<
  CoachOverviewState,
  {
    readonly feedbackRole: CoachOverviewFeedbackRole;
    readonly feedbackTone: CoachOverviewFeedbackTone;
    readonly showSummaries: boolean;
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
} as const satisfies Record<CoachOverviewErrorCode, CoachOverviewState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function hasProjectionContext(
  snapshot: CoachOverviewSnapshot,
): snapshot is CoachOverviewSnapshot & {
  readonly projectionContext: CoachOverviewProjectionContext;
} {
  return (
    snapshot.projectionContext !== undefined &&
    hasValue(snapshot.projectionContext.affectedProjectionReference) &&
    snapshot.projectionContext.sourceEvidenceReferences.length > 0
  );
}

function hasAllowlistedFilters(snapshot: CoachOverviewSnapshot): boolean {
  return snapshot.selectedFilterReferences.every((selectedReference) =>
    snapshot.filterOptions.some((option) => option.filterReference === selectedReference),
  );
}

export function mapCoachOverviewErrorCode(code: CoachOverviewErrorCode): CoachOverviewState {
  return stateByErrorCode[code];
}

export function isCoachOverviewIntentEnabled(
  state: CoachOverviewState,
  kind: CoachOverviewIntentKind,
  snapshot: CoachOverviewSnapshot,
  summary?: CoachOverviewSummary,
): boolean {
  if (kind === 'review_summary') {
    return (state === 'ready' || state === 'recovery') && summary?.reviewAvailable === true;
  }

  if (kind === 'refresh_overview') {
    return (
      (state === 'ready' || state === 'empty' || state === 'recovery') &&
      hasAllowlistedFilters(snapshot)
    );
  }

  if (kind === 'request_projection_reconciliation') {
    return (
      (state === 'stale_or_conflicting_state' ||
        state === 'duplicate_or_already_applied' ||
        state === 'lifecycle_conflict' ||
        state === 'recovery') &&
      hasProjectionContext(snapshot)
    );
  }

  return (
    (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
    hasProjectionContext(snapshot) &&
    hasValue(snapshot.projectionContext?.retryContext)
  );
}

export function createCoachOverviewIntent(
  kind: CoachOverviewIntentKind,
  snapshot: CoachOverviewSnapshot,
  summary?: CoachOverviewSummary,
): CoachOverviewIntent | undefined {
  if (kind === 'review_summary' && summary !== undefined && summary.reviewAvailable) {
    return Object.freeze({
      kind,
      summaryReference: summary.summaryReference,
      category: summary.category,
    });
  }

  if (kind === 'refresh_overview' && hasAllowlistedFilters(snapshot)) {
    return Object.freeze({
      kind,
      selectedFilterReferences: Object.freeze([...snapshot.selectedFilterReferences]),
      ...(snapshot.timeWindowContext === undefined
        ? {}
        : { timeWindowContext: snapshot.timeWindowContext }),
    });
  }

  if (kind === 'request_projection_reconciliation' && hasProjectionContext(snapshot)) {
    return Object.freeze({
      kind,
      affectedProjectionReference: snapshot.projectionContext.affectedProjectionReference,
      sourceEvidenceReferences: Object.freeze([
        ...snapshot.projectionContext.sourceEvidenceReferences,
      ]),
    });
  }

  if (
    kind === 'retry' &&
    hasProjectionContext(snapshot) &&
    hasValue(snapshot.projectionContext?.retryContext)
  ) {
    return Object.freeze({
      kind,
      affectedProjectionReference: snapshot.projectionContext.affectedProjectionReference,
      retryContext: snapshot.projectionContext.retryContext,
    });
  }

  return undefined;
}

export function getCoachOverviewViewModel(
  locale: SupportedLocale,
  state: CoachOverviewState,
  snapshot: CoachOverviewSnapshot,
  visibility: CoachOverviewVisibility,
): CoachOverviewViewModel {
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
    feedbackRole: presentation.feedbackRole,
    feedbackTone: presentation.feedbackTone,
    showSummaries: presentation.showSummaries && snapshot.summaries.length > 0,
    filterSelectionEnabled:
      state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(coachOverviewIntentKinds.filter((kind) => visibility[kind])),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      overviewStatusReference: snapshot.overviewStatusReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      summaryReferences: Object.freeze(
        snapshot.summaries.map((summary) => summary.summaryReference),
      ),
      selectedFilterReferences: Object.freeze([...snapshot.selectedFilterReferences]),
      affectedProjectionReference: snapshot.projectionContext?.affectedProjectionReference,
      sourceEvidenceReferences: Object.freeze([
        ...(snapshot.projectionContext?.sourceEvidenceReferences ?? []),
      ]),
    }),
  };
}
