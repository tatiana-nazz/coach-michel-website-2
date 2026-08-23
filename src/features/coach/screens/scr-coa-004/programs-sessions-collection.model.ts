import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const programsSessionsCollectionStates = [
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

export type ProgramsSessionsCollectionState = (typeof programsSessionsCollectionStates)[number];

export const programsSessionsCollectionErrorCodes = [
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

export type ProgramsSessionsCollectionErrorCode =
  (typeof programsSessionsCollectionErrorCodes)[number];

export const programsSessionsCollectionIntentKinds = [
  'review_item',
  'prepare_draft_intent',
  'refresh_collection',
  'retry',
  'reconcile',
] as const;

export type ProgramsSessionsCollectionIntentKind =
  (typeof programsSessionsCollectionIntentKinds)[number];
export type ProgramsSessionsCollectionFeedbackRole = 'status' | 'alert';
export type ProgramsSessionsCollectionFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface ProgramsSessionsCollectionOption {
  readonly optionReference: string;
  readonly label: string;
}

interface ProgramsSessionsCollectionItemBase {
  readonly orderingReference: string;
  readonly traineeReference: string;
  readonly draftReference?: string;
  readonly draftVersionReference?: string;
  readonly displayLabel: string;
  readonly statusLabel: string;
  readonly scheduleLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
  readonly draftIntentAvailable: boolean;
}

export interface ProgramsSessionsProgramItem extends ProgramsSessionsCollectionItemBase {
  readonly kind: 'program';
  readonly programReference: string;
}

export interface ProgramsSessionsSessionItem extends ProgramsSessionsCollectionItemBase {
  readonly kind: 'session';
  readonly sessionReference: string;
}

export type ProgramsSessionsCollectionItem =
  ProgramsSessionsProgramItem | ProgramsSessionsSessionItem;

export interface ProgramsSessionsCollectionRecoveryContext {
  readonly retryContext: string;
  readonly reconciliationContext: string;
}

export interface ProgramsSessionsCollectionSnapshot {
  readonly collectionReference: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly boundedTimeContext?: string;
  readonly programs: readonly ProgramsSessionsProgramItem[];
  readonly sessions: readonly ProgramsSessionsSessionItem[];
  readonly filterOptions: readonly ProgramsSessionsCollectionOption[];
  readonly selectedFilterReference?: string;
  readonly sortOptions: readonly ProgramsSessionsCollectionOption[];
  readonly selectedSortReference?: string;
  readonly recoveryContext?: ProgramsSessionsCollectionRecoveryContext;
}

export type ProgramsSessionsCollectionVisibility = Readonly<
  Record<ProgramsSessionsCollectionIntentKind, boolean>
>;

export interface ProgramsSessionsCollectionCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly controlsHeading: string;
  readonly filterLabel: string;
  readonly filterPlaceholder: string;
  readonly sortLabel: string;
  readonly sortPlaceholder: string;
  readonly programsHeading: string;
  readonly sessionsHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<ProgramsSessionsCollectionIntentKind, string>>;
  readonly feedback: Readonly<Record<ProgramsSessionsCollectionState, string>>;
}

export interface ProgramsSessionsCollectionContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly controlsBody: string;
  readonly programsBody: string;
  readonly sessionsBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type ProgramsSessionsCollectionIntent =
  | Readonly<{
      kind: 'review_item';
      collectionReference: string;
      itemKind: ProgramsSessionsCollectionItem['kind'];
      itemReference: string;
      traineeReference: string;
      draftReference?: string;
    }>
  | Readonly<{
      kind: 'prepare_draft_intent';
      collectionReference: string;
      itemKind: ProgramsSessionsCollectionItem['kind'];
      itemReference: string;
      traineeReference: string;
      draftReference?: string;
      draftVersionReference?: string;
    }>
  | Readonly<{
      kind: 'refresh_collection';
      collectionReference: string;
      boundedTimeContext?: string;
      selectedFilterReference?: string;
      selectedSortReference?: string;
    }>
  | Readonly<{
      kind: 'retry';
      collectionReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      collectionReference: string;
      itemReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface ProgramsSessionsCollectionViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ProgramsSessionsCollectionState;
  readonly feedbackRole: ProgramsSessionsCollectionFeedbackRole;
  readonly feedbackTone: ProgramsSessionsCollectionFeedbackTone;
  readonly showPrograms: boolean;
  readonly showSessions: boolean;
  readonly controlsEnabled: boolean;
  readonly visibleIntents: readonly ProgramsSessionsCollectionIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    collectionReference: string;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    programReferences: readonly string[];
    sessionReferences: readonly string[];
    traineeReferences: readonly string[];
    draftReferences: readonly string[];
    draftVersionReferences: readonly string[];
    orderingReferences: readonly string[];
    selectedFilterReference: string | undefined;
    selectedSortReference: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showCollection: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showCollection: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showCollection: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showCollection: true },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showCollection: false,
  },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showCollection: false },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showCollection: false },
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
    showCollection: true,
  },
  lifecycle_conflict: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCollection: true,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCollection: true,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showCollection: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showCollection: true },
  authoritative_final: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showCollection: true,
  },
} as const satisfies Record<
  ProgramsSessionsCollectionState,
  {
    readonly feedbackRole: ProgramsSessionsCollectionFeedbackRole;
    readonly feedbackTone: ProgramsSessionsCollectionFeedbackTone;
    readonly showCollection: boolean;
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
} as const satisfies Record<ProgramsSessionsCollectionErrorCode, ProgramsSessionsCollectionState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function itemReference(item: ProgramsSessionsCollectionItem): string {
  return item.kind === 'program' ? item.programReference : item.sessionReference;
}

function selectedOptionExists(
  selectedReference: string | undefined,
  options: readonly ProgramsSessionsCollectionOption[],
): boolean {
  return (
    selectedReference === undefined ||
    options.some((option) => option.optionReference === selectedReference)
  );
}

export function mapProgramsSessionsCollectionErrorCode(
  code: ProgramsSessionsCollectionErrorCode,
): ProgramsSessionsCollectionState {
  return stateByErrorCode[code];
}

export function isProgramsSessionsCollectionIntentEnabled(
  state: ProgramsSessionsCollectionState,
  kind: ProgramsSessionsCollectionIntentKind,
  snapshot: ProgramsSessionsCollectionSnapshot,
  item?: ProgramsSessionsCollectionItem,
): boolean {
  if (kind === 'review_item') {
    return (state === 'ready' || state === 'recovery') && item?.reviewAvailable === true;
  }

  if (kind === 'prepare_draft_intent') {
    return (state === 'ready' || state === 'recovery') && item?.draftIntentAvailable === true;
  }

  if (kind === 'refresh_collection') {
    return (
      (state === 'ready' || state === 'empty' || state === 'recovery') &&
      selectedOptionExists(snapshot.selectedFilterReference, snapshot.filterOptions) &&
      selectedOptionExists(snapshot.selectedSortReference, snapshot.sortOptions)
    );
  }

  if (kind === 'retry') {
    return (
      (state === 'dependency_unavailable' || state === 'rate_limited' || state === 'recovery') &&
      hasValue(snapshot.recoveryContext?.retryContext)
    );
  }

  return (
    (state === 'stale_or_conflicting_state' ||
      state === 'lifecycle_conflict' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    snapshot.programs.length + snapshot.sessions.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  );
}

export function createProgramsSessionsCollectionIntent(
  kind: ProgramsSessionsCollectionIntentKind,
  snapshot: ProgramsSessionsCollectionSnapshot,
  item?: ProgramsSessionsCollectionItem,
): ProgramsSessionsCollectionIntent | undefined {
  if (kind === 'review_item' && item !== undefined && item.reviewAvailable) {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      itemKind: item.kind,
      itemReference: itemReference(item),
      traineeReference: item.traineeReference,
      ...(item.draftReference === undefined ? {} : { draftReference: item.draftReference }),
    });
  }

  if (kind === 'prepare_draft_intent' && item !== undefined && item.draftIntentAvailable) {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      itemKind: item.kind,
      itemReference: itemReference(item),
      traineeReference: item.traineeReference,
      ...(item.draftReference === undefined ? {} : { draftReference: item.draftReference }),
      ...(item.draftVersionReference === undefined
        ? {}
        : { draftVersionReference: item.draftVersionReference }),
    });
  }

  if (kind === 'refresh_collection') {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      ...(snapshot.boundedTimeContext === undefined
        ? {}
        : { boundedTimeContext: snapshot.boundedTimeContext }),
      ...(snapshot.selectedFilterReference === undefined
        ? {}
        : { selectedFilterReference: snapshot.selectedFilterReference }),
      ...(snapshot.selectedSortReference === undefined
        ? {}
        : { selectedSortReference: snapshot.selectedSortReference }),
    });
  }

  if (kind === 'retry' && hasValue(snapshot.recoveryContext?.retryContext)) {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      retryContext: snapshot.recoveryContext.retryContext,
    });
  }

  if (
    kind === 'reconcile' &&
    snapshot.programs.length + snapshot.sessions.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  ) {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      itemReferences: Object.freeze([
        ...snapshot.programs.map((program) => program.programReference),
        ...snapshot.sessions.map((session) => session.sessionReference),
      ]),
      reconciliationContext: snapshot.recoveryContext.reconciliationContext,
    });
  }

  return undefined;
}

export function getProgramsSessionsCollectionViewModel(
  locale: SupportedLocale,
  state: ProgramsSessionsCollectionState,
  snapshot: ProgramsSessionsCollectionSnapshot,
  visibility: ProgramsSessionsCollectionVisibility,
): ProgramsSessionsCollectionViewModel {
  const presentation = statePresentation[state];
  const allItems: readonly ProgramsSessionsCollectionItem[] = [
    ...snapshot.programs,
    ...snapshot.sessions,
  ];
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
    showPrograms: presentation.showCollection && snapshot.programs.length > 0,
    showSessions: presentation.showCollection && snapshot.sessions.length > 0,
    controlsEnabled: state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(
      programsSessionsCollectionIntentKinds.filter((kind) => visibility[kind]),
    ),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      collectionReference: snapshot.collectionReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      programReferences: Object.freeze(
        snapshot.programs.map((program) => program.programReference),
      ),
      sessionReferences: Object.freeze(
        snapshot.sessions.map((session) => session.sessionReference),
      ),
      traineeReferences: Object.freeze(allItems.map((item) => item.traineeReference)),
      draftReferences: Object.freeze(
        allItems.flatMap((item) =>
          item.draftReference === undefined ? [] : [item.draftReference],
        ),
      ),
      draftVersionReferences: Object.freeze(
        allItems.flatMap((item) =>
          item.draftVersionReference === undefined ? [] : [item.draftVersionReference],
        ),
      ),
      orderingReferences: Object.freeze(allItems.map((item) => item.orderingReference)),
      selectedFilterReference: snapshot.selectedFilterReference,
      selectedSortReference: snapshot.selectedSortReference,
    }),
  };
}
