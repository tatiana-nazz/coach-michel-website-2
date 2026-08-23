import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const exerciseCatalogueStates = [
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

export type ExerciseCatalogueState = (typeof exerciseCatalogueStates)[number];

export const exerciseCatalogueErrorCodes = [
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

export type ExerciseCatalogueErrorCode = (typeof exerciseCatalogueErrorCodes)[number];

export const exerciseCatalogueIntentKinds = [
  'review_exercise',
  'prepare_content_draft_intent',
  'review_publication_context',
  'refresh_catalogue',
  'retry',
  'reconcile',
] as const;

export type ExerciseCatalogueIntentKind = (typeof exerciseCatalogueIntentKinds)[number];
export type ExerciseCatalogueFeedbackRole = 'status' | 'alert';
export type ExerciseCatalogueFeedbackTone = 'info' | 'danger' | 'warning' | 'success';

export interface ExerciseCatalogueOption {
  readonly optionReference: string;
  readonly label: string;
}

export interface ExerciseCatalogueItem {
  readonly exerciseReference: string;
  readonly orderingReference: string;
  readonly contentDraftReference?: string;
  readonly draftVersionReference?: string;
  readonly publicationDecisionReference?: string;
  readonly evidenceReferences: readonly string[];
  readonly displayLabel: string;
  readonly approvalStatusLabel: string;
  readonly safetyStatusLabel: string;
  readonly rightsStatusLabel: string;
  readonly complexityStatusLabel: string;
  readonly languageStatusLabel: string;
  readonly accessibilityStatusLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
  readonly draftIntentAvailable: boolean;
  readonly publicationContextAvailable: boolean;
}

export interface ExerciseCatalogueRecoveryContext {
  readonly retryContext: string;
  readonly reconciliationContext: string;
}

export interface ExerciseCatalogueSnapshot {
  readonly catalogueReference: string;
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly boundedTimeContext?: string;
  readonly exercises: readonly ExerciseCatalogueItem[];
  readonly approvalFilterOptions: readonly ExerciseCatalogueOption[];
  readonly selectedApprovalFilterReference?: string;
  readonly sortOptions: readonly ExerciseCatalogueOption[];
  readonly selectedSortReference?: string;
  readonly recoveryContext?: ExerciseCatalogueRecoveryContext;
}

export type ExerciseCatalogueVisibility = Readonly<Record<ExerciseCatalogueIntentKind, boolean>>;

export interface ExerciseCatalogueCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly controlsHeading: string;
  readonly approvalFilterLabel: string;
  readonly approvalFilterPlaceholder: string;
  readonly sortLabel: string;
  readonly sortPlaceholder: string;
  readonly catalogueHeading: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<ExerciseCatalogueIntentKind, string>>;
  readonly feedback: Readonly<Record<ExerciseCatalogueState, string>>;
}

export interface ExerciseCatalogueContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly controlsBody: string;
  readonly catalogueBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type ExerciseCatalogueIntent =
  | Readonly<{
      kind: 'review_exercise';
      catalogueReference: string;
      exerciseReference: string;
      contentDraftReference?: string;
    }>
  | Readonly<{
      kind: 'prepare_content_draft_intent';
      catalogueReference: string;
      exerciseReference: string;
      contentDraftReference?: string;
      draftVersionReference?: string;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'review_publication_context';
      catalogueReference: string;
      exerciseReference: string;
      publicationDecisionReference: string;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'refresh_catalogue';
      catalogueReference: string;
      boundedTimeContext?: string;
      selectedApprovalFilterReference?: string;
      selectedSortReference?: string;
    }>
  | Readonly<{
      kind: 'retry';
      catalogueReference: string;
      retryContext: string;
    }>
  | Readonly<{
      kind: 'reconcile';
      catalogueReference: string;
      exerciseReferences: readonly string[];
      evidenceReferences: readonly string[];
      reconciliationContext: string;
    }>;

export interface ExerciseCatalogueViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: ExerciseCatalogueState;
  readonly feedbackRole: ExerciseCatalogueFeedbackRole;
  readonly feedbackTone: ExerciseCatalogueFeedbackTone;
  readonly showCatalogue: boolean;
  readonly controlsEnabled: boolean;
  readonly visibleIntents: readonly ExerciseCatalogueIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    catalogueReference: string;
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    exerciseReferences: readonly string[];
    orderingReferences: readonly string[];
    contentDraftReferences: readonly string[];
    draftVersionReferences: readonly string[];
    publicationDecisionReferences: readonly string[];
    evidenceReferences: readonly string[];
    selectedApprovalFilterReference: string | undefined;
    selectedSortReference: string | undefined;
  }>;
}

const statePresentation = {
  loading: { feedbackRole: 'status', feedbackTone: 'info', showCatalogue: false },
  ready: { feedbackRole: 'status', feedbackTone: 'info', showCatalogue: true },
  empty: { feedbackRole: 'status', feedbackTone: 'info', showCatalogue: false },
  validation_error: { feedbackRole: 'alert', feedbackTone: 'danger', showCatalogue: true },
  authentication_required: {
    feedbackRole: 'alert',
    feedbackTone: 'danger',
    showCatalogue: false,
  },
  authority_denied: { feedbackRole: 'alert', feedbackTone: 'danger', showCatalogue: false },
  resource_not_found: { feedbackRole: 'alert', feedbackTone: 'warning', showCatalogue: false },
  resource_not_found_or_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCatalogue: false,
  },
  dependency_unavailable: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCatalogue: false,
  },
  rate_limited: { feedbackRole: 'alert', feedbackTone: 'warning', showCatalogue: false },
  stale_or_conflicting_state: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCatalogue: true,
  },
  lifecycle_conflict: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCatalogue: true,
  },
  duplicate_or_already_applied: {
    feedbackRole: 'alert',
    feedbackTone: 'warning',
    showCatalogue: true,
  },
  pending: { feedbackRole: 'status', feedbackTone: 'info', showCatalogue: true },
  recovery: { feedbackRole: 'status', feedbackTone: 'info', showCatalogue: true },
  authoritative_final: {
    feedbackRole: 'status',
    feedbackTone: 'success',
    showCatalogue: true,
  },
} as const satisfies Record<
  ExerciseCatalogueState,
  {
    readonly feedbackRole: ExerciseCatalogueFeedbackRole;
    readonly feedbackTone: ExerciseCatalogueFeedbackTone;
    readonly showCatalogue: boolean;
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
} as const satisfies Record<ExerciseCatalogueErrorCode, ExerciseCatalogueState>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function selectedOptionExists(
  selectedReference: string | undefined,
  options: readonly ExerciseCatalogueOption[],
): boolean {
  return (
    selectedReference === undefined ||
    options.some((option) => option.optionReference === selectedReference)
  );
}

export function mapExerciseCatalogueErrorCode(
  code: ExerciseCatalogueErrorCode,
): ExerciseCatalogueState {
  return stateByErrorCode[code];
}

export function isExerciseCatalogueIntentEnabled(
  state: ExerciseCatalogueState,
  kind: ExerciseCatalogueIntentKind,
  snapshot: ExerciseCatalogueSnapshot,
  exercise?: ExerciseCatalogueItem,
): boolean {
  if (kind === 'review_exercise') {
    return (state === 'ready' || state === 'recovery') && exercise?.reviewAvailable === true;
  }

  if (kind === 'prepare_content_draft_intent') {
    return (state === 'ready' || state === 'recovery') && exercise?.draftIntentAvailable === true;
  }

  if (kind === 'review_publication_context') {
    return (
      (state === 'ready' || state === 'recovery' || state === 'authoritative_final') &&
      exercise?.publicationContextAvailable === true &&
      hasValue(exercise.publicationDecisionReference)
    );
  }

  if (kind === 'refresh_catalogue') {
    return (
      (state === 'ready' || state === 'empty' || state === 'recovery') &&
      selectedOptionExists(
        snapshot.selectedApprovalFilterReference,
        snapshot.approvalFilterOptions,
      ) &&
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
    snapshot.exercises.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  );
}

export function createExerciseCatalogueIntent(
  kind: ExerciseCatalogueIntentKind,
  snapshot: ExerciseCatalogueSnapshot,
  exercise?: ExerciseCatalogueItem,
): ExerciseCatalogueIntent | undefined {
  if (kind === 'review_exercise' && exercise !== undefined && exercise.reviewAvailable) {
    return Object.freeze({
      kind,
      catalogueReference: snapshot.catalogueReference,
      exerciseReference: exercise.exerciseReference,
      ...(exercise.contentDraftReference === undefined
        ? {}
        : { contentDraftReference: exercise.contentDraftReference }),
    });
  }

  if (
    kind === 'prepare_content_draft_intent' &&
    exercise !== undefined &&
    exercise.draftIntentAvailable
  ) {
    return Object.freeze({
      kind,
      catalogueReference: snapshot.catalogueReference,
      exerciseReference: exercise.exerciseReference,
      ...(exercise.contentDraftReference === undefined
        ? {}
        : { contentDraftReference: exercise.contentDraftReference }),
      ...(exercise.draftVersionReference === undefined
        ? {}
        : { draftVersionReference: exercise.draftVersionReference }),
      evidenceReferences: Object.freeze([...exercise.evidenceReferences]),
    });
  }

  if (
    kind === 'review_publication_context' &&
    exercise !== undefined &&
    exercise.publicationContextAvailable &&
    hasValue(exercise.publicationDecisionReference)
  ) {
    return Object.freeze({
      kind,
      catalogueReference: snapshot.catalogueReference,
      exerciseReference: exercise.exerciseReference,
      publicationDecisionReference: exercise.publicationDecisionReference,
      evidenceReferences: Object.freeze([...exercise.evidenceReferences]),
    });
  }

  if (kind === 'refresh_catalogue') {
    return Object.freeze({
      kind,
      catalogueReference: snapshot.catalogueReference,
      ...(snapshot.boundedTimeContext === undefined
        ? {}
        : { boundedTimeContext: snapshot.boundedTimeContext }),
      ...(snapshot.selectedApprovalFilterReference === undefined
        ? {}
        : { selectedApprovalFilterReference: snapshot.selectedApprovalFilterReference }),
      ...(snapshot.selectedSortReference === undefined
        ? {}
        : { selectedSortReference: snapshot.selectedSortReference }),
    });
  }

  if (kind === 'retry' && hasValue(snapshot.recoveryContext?.retryContext)) {
    return Object.freeze({
      kind,
      catalogueReference: snapshot.catalogueReference,
      retryContext: snapshot.recoveryContext.retryContext,
    });
  }

  if (
    kind === 'reconcile' &&
    snapshot.exercises.length > 0 &&
    hasValue(snapshot.recoveryContext?.reconciliationContext)
  ) {
    return Object.freeze({
      kind,
      catalogueReference: snapshot.catalogueReference,
      exerciseReferences: Object.freeze(snapshot.exercises.map((item) => item.exerciseReference)),
      evidenceReferences: Object.freeze(
        snapshot.exercises.flatMap((item) => [...item.evidenceReferences]),
      ),
      reconciliationContext: snapshot.recoveryContext.reconciliationContext,
    });
  }

  return undefined;
}

export function getExerciseCatalogueViewModel(
  locale: SupportedLocale,
  state: ExerciseCatalogueState,
  snapshot: ExerciseCatalogueSnapshot,
  visibility: ExerciseCatalogueVisibility,
): ExerciseCatalogueViewModel {
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
    showCatalogue: presentation.showCatalogue && snapshot.exercises.length > 0,
    controlsEnabled: state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(exerciseCatalogueIntentKinds.filter((kind) => visibility[kind])),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      catalogueReference: snapshot.catalogueReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      exerciseReferences: Object.freeze(
        snapshot.exercises.map((exercise) => exercise.exerciseReference),
      ),
      orderingReferences: Object.freeze(
        snapshot.exercises.map((exercise) => exercise.orderingReference),
      ),
      contentDraftReferences: Object.freeze(
        snapshot.exercises.flatMap((exercise) =>
          exercise.contentDraftReference === undefined ? [] : [exercise.contentDraftReference],
        ),
      ),
      draftVersionReferences: Object.freeze(
        snapshot.exercises.flatMap((exercise) =>
          exercise.draftVersionReference === undefined ? [] : [exercise.draftVersionReference],
        ),
      ),
      publicationDecisionReferences: Object.freeze(
        snapshot.exercises.flatMap((exercise) =>
          exercise.publicationDecisionReference === undefined
            ? []
            : [exercise.publicationDecisionReference],
        ),
      ),
      evidenceReferences: Object.freeze(
        snapshot.exercises.flatMap((exercise) => [...exercise.evidenceReferences]),
      ),
      selectedApprovalFilterReference: snapshot.selectedApprovalFilterReference,
      selectedSortReference: snapshot.selectedSortReference,
    }),
  };
}
