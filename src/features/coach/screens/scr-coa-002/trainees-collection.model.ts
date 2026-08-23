import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const traineesCollectionStates = [
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

export type TraineesCollectionState = (typeof traineesCollectionStates)[number];

export const traineesCollectionErrorCodes = [
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'AUTHORITY_DENIED',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
] as const;

export type TraineesCollectionErrorCode = (typeof traineesCollectionErrorCodes)[number];

export const traineesCollectionIntentKinds = [
  'select_trainee',
  'refresh_collection',
  'retry',
  'reconcile',
] as const;

export type TraineesCollectionIntentKind = (typeof traineesCollectionIntentKinds)[number];
export type TraineesCollectionFeedbackRole = 'status' | 'alert';
export type TraineesCollectionFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface TraineesCollectionOption {
  readonly optionReference: string;
  readonly label: string;
}

export interface TraineesCollectionItem {
  readonly traineeReference: string;
  readonly orderingReference: string;
  readonly displayLabel: string;
  readonly statusLabel: string;
  readonly summary: string;
  readonly selectionAvailable: boolean;
}

export interface TraineesCollectionRecoveryContext {
  readonly retryContext: string;
  readonly reconciliationContext: string;
}

export interface TraineesCollectionSnapshot {
  readonly collectionReference: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly coachGrantReference?: string;
  readonly trainees: readonly TraineesCollectionItem[];
  readonly searchOptions: readonly TraineesCollectionOption[];
  readonly selectedSearchReference?: string;
  readonly filterOptions: readonly TraineesCollectionOption[];
  readonly selectedFilterReference?: string;
  readonly sortOptions: readonly TraineesCollectionOption[];
  readonly selectedSortReference?: string;
  readonly recoveryContext?: TraineesCollectionRecoveryContext;
}

export type TraineesCollectionVisibility = Readonly<Record<TraineesCollectionIntentKind, boolean>>;

export interface TraineesCollectionCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly controlsHeading: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly filterLabel: string;
  readonly filterPlaceholder: string;
  readonly sortLabel: string;
  readonly sortPlaceholder: string;
  readonly collectionHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<TraineesCollectionIntentKind, string>>;
  readonly feedback: Readonly<Record<TraineesCollectionState, string>>;
}

export interface TraineesCollectionContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly controlsBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type TraineesCollectionIntent =
  | Readonly<{
      kind: 'select_trainee';
      collectionReference: string;
      traineeReference: string;
      orderingReference: string;
    }>
  | Readonly<{
      kind: 'refresh_collection';
      collectionReference: string;
      coachGrantReference?: string;
      selectedSearchReference?: string;
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
      traineeReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface TraineesCollectionViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: TraineesCollectionState;
  readonly feedbackRole: TraineesCollectionFeedbackRole;
  readonly feedbackTone: TraineesCollectionFeedbackTone;
  readonly showCollection: boolean;
  readonly controlsEnabled: boolean;
  readonly visibleIntents: readonly TraineesCollectionIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    collectionReference: string;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    coachGrantReference: string | undefined;
    traineeReferences: readonly string[];
    orderingReferences: readonly string[];
    selectedSearchReference: string | undefined;
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
  TraineesCollectionState,
  {
    readonly feedbackRole: TraineesCollectionFeedbackRole;
    readonly feedbackTone: TraineesCollectionFeedbackTone;
    readonly showCollection: boolean;
  }
>;

const stateByErrorCode = {
  AUTHENTICATION_REQUIRED_OR_INVALID: 'authentication_required',
  AUTHORITY_DENIED: 'authority_denied',
  DEPENDENCY_UNAVAILABLE: 'dependency_unavailable',
  RATE_LIMITED: 'rate_limited',
  RESOURCE_NOT_FOUND_OR_UNAVAILABLE: 'resource_not_found_or_unavailable',
  STALE_OR_CONFLICTING_STATE: 'stale_or_conflicting_state',
} as const satisfies Record<TraineesCollectionErrorCode, TraineesCollectionState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function selectedOptionExists(
  selectedReference: string | undefined,
  options: readonly TraineesCollectionOption[],
): boolean {
  return (
    selectedReference === undefined ||
    options.some((option) => option.optionReference === selectedReference)
  );
}

export function mapTraineesCollectionErrorCode(
  code: TraineesCollectionErrorCode,
): TraineesCollectionState {
  return stateByErrorCode[code];
}

export function isTraineesCollectionIntentEnabled(
  state: TraineesCollectionState,
  kind: TraineesCollectionIntentKind,
  snapshot: TraineesCollectionSnapshot,
  trainee?: TraineesCollectionItem,
): boolean {
  if (kind === 'select_trainee') {
    return (state === 'ready' || state === 'recovery') && trainee?.selectionAvailable === true;
  }

  if (
    kind === 'refresh_collection' &&
    selectedOptionExists(snapshot.selectedSearchReference, snapshot.searchOptions) &&
    selectedOptionExists(snapshot.selectedFilterReference, snapshot.filterOptions) &&
    selectedOptionExists(snapshot.selectedSortReference, snapshot.sortOptions)
  ) {
    return (
      (state === 'ready' || state === 'empty' || state === 'recovery') &&
      selectedOptionExists(snapshot.selectedSearchReference, snapshot.searchOptions) &&
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
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    snapshot.trainees.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  );
}

export function createTraineesCollectionIntent(
  kind: TraineesCollectionIntentKind,
  snapshot: TraineesCollectionSnapshot,
  trainee?: TraineesCollectionItem,
): TraineesCollectionIntent | undefined {
  if (kind === 'select_trainee' && trainee !== undefined && trainee.selectionAvailable) {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      traineeReference: trainee.traineeReference,
      orderingReference: trainee.orderingReference,
    });
  }

  if (kind === 'refresh_collection') {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      ...(snapshot.coachGrantReference === undefined
        ? {}
        : { coachGrantReference: snapshot.coachGrantReference }),
      ...(snapshot.selectedSearchReference === undefined
        ? {}
        : { selectedSearchReference: snapshot.selectedSearchReference }),
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
    snapshot.trainees.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  ) {
    return Object.freeze({
      kind,
      collectionReference: snapshot.collectionReference,
      traineeReferences: Object.freeze(
        snapshot.trainees.map((traineeItem) => traineeItem.traineeReference),
      ),
      reconciliationContext: snapshot.recoveryContext.reconciliationContext,
    });
  }

  return undefined;
}

export function getTraineesCollectionViewModel(
  locale: SupportedLocale,
  state: TraineesCollectionState,
  snapshot: TraineesCollectionSnapshot,
  visibility: TraineesCollectionVisibility,
): TraineesCollectionViewModel {
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
    showCollection: presentation.showCollection && snapshot.trainees.length > 0,
    controlsEnabled: state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(traineesCollectionIntentKinds.filter((kind) => visibility[kind])),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      collectionReference: snapshot.collectionReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      coachGrantReference: snapshot.coachGrantReference,
      traineeReferences: Object.freeze(
        snapshot.trainees.map((trainee) => trainee.traineeReference),
      ),
      orderingReferences: Object.freeze(
        snapshot.trainees.map((trainee) => trainee.orderingReference),
      ),
      selectedSearchReference: snapshot.selectedSearchReference,
      selectedFilterReference: snapshot.selectedFilterReference,
      selectedSortReference: snapshot.selectedSortReference,
    }),
  };
}
