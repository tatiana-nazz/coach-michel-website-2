import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale, type TextDirection } from '@/i18n/direction';

export const adminAccountNoticesExternalEscalationStates = [
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

export type AdminAccountNoticesExternalEscalationState =
  (typeof adminAccountNoticesExternalEscalationStates)[number];

export const adminAccountNoticesExternalEscalationErrorCodes = [
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

export type AdminAccountNoticesExternalEscalationErrorCode =
  (typeof adminAccountNoticesExternalEscalationErrorCodes)[number];

export const adminAccountNoticesExternalEscalationIntentKinds = [
  'review_admin_context',
  'review_notice',
  'review_policy_approval_context',
  'review_support_case',
  'external_handoff',
  'refresh_context',
  'retry',
  'reconcile',
] as const;

export type AdminAccountNoticesExternalEscalationIntentKind =
  (typeof adminAccountNoticesExternalEscalationIntentKinds)[number];
export type AdminAccountNoticesExternalEscalationVisibility = Readonly<
  Record<AdminAccountNoticesExternalEscalationIntentKind, boolean>
>;
export type AdminAccountNoticesExternalEscalationFeedbackRole = 'status' | 'alert';
export type AdminAccountNoticesExternalEscalationFeedbackTone =
  'info' | 'danger' | 'warning' | 'success';

export interface AdminAccountNotice {
  readonly orderingReference: string;
  readonly noticeReference: string;
  readonly disclosureVersionReference?: string;
  readonly effectiveTimeContext?: string;
  readonly heading: string;
  readonly body: string;
  readonly statusLabel: string;
  readonly reviewAvailable: boolean;
}

export interface AdminPolicyApprovalContext {
  readonly orderingReference: string;
  readonly contextReference: string;
  readonly subjectVersionReference?: string;
  readonly policyReference?: string;
  readonly approvalReference?: string;
  readonly evidenceReferences: readonly string[];
  readonly heading: string;
  readonly statusLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
}

export interface AdminSupportPrivacyCase {
  readonly orderingReference: string;
  readonly caseReference: string;
  readonly purposeScopeReference?: string;
  readonly evidenceReferences: readonly string[];
  readonly heading: string;
  readonly statusLabel: string;
  readonly summary: string;
  readonly reviewAvailable: boolean;
}

export interface AdminExternalHandoffOption {
  readonly orderingReference: string;
  readonly optionReference: string;
  readonly correlationReference: string;
  readonly minimumBusinessIntentReference: string;
  readonly purposeContextReference: string;
  readonly label: string;
  readonly description: string;
  readonly consequence: string;
  readonly handoffAvailable: boolean;
}

export interface AdminAccountNoticesExternalEscalationSnapshot {
  readonly workspaceReference: string;
  readonly accountReference: string;
  readonly adminContextReferences: readonly string[];
  readonly authorityStatusReference: string;
  readonly lifecycleStatusReference: string;
  readonly notices: readonly AdminAccountNotice[];
  readonly policyApprovalContexts: readonly AdminPolicyApprovalContext[];
  readonly supportPrivacyCases: readonly AdminSupportPrivacyCase[];
  readonly externalHandoffOptions: readonly AdminExternalHandoffOption[];
  readonly selectedExternalHandoffOptionReference?: string;
  readonly retryContext?: string;
  readonly reconciliationContext?: string;
}

export interface AdminAccountNoticesExternalEscalationCopy {
  readonly contextLabel: string;
  readonly title: string;
  readonly authorityHeading: string;
  readonly adminHeading: string;
  readonly noticesHeading: string;
  readonly policyApprovalHeading: string;
  readonly supportCasesHeading: string;
  readonly handoffHeading: string;
  readonly handoffLabel: string;
  readonly handoffPlaceholder: string;
  readonly consequenceHeading: string;
  readonly actionsHeading: string;
  readonly feedbackHeading: string;
  readonly helpHeading: string;
  readonly intentLabels: Readonly<Record<AdminAccountNoticesExternalEscalationIntentKind, string>>;
  readonly feedback: Readonly<Record<AdminAccountNoticesExternalEscalationState, string>>;
}

export interface AdminAccountNoticesExternalEscalationContent {
  readonly contextBody: string;
  readonly authorityBody: string;
  readonly adminBody: string;
  readonly noticesBody: string;
  readonly policyApprovalBody: string;
  readonly supportCasesBody: string;
  readonly handoffBody: string;
  readonly localConsequenceBody: string;
  readonly pendingConsequenceBody: string;
  readonly authoritativeFinalConsequenceBody: string;
  readonly helpBody: string;
}

export type AdminAccountNoticesExternalEscalationIntent =
  | Readonly<{
      kind: 'review_admin_context';
      workspaceReference: string;
      accountReference: string;
      adminContextReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'review_notice';
      workspaceReference: string;
      noticeReference: string;
      disclosureVersionReference?: string;
    }>
  | Readonly<{
      kind: 'review_policy_approval_context';
      workspaceReference: string;
      contextReference: string;
      subjectVersionReference?: string;
      policyReference?: string;
      approvalReference?: string;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'review_support_case';
      workspaceReference: string;
      caseReference: string;
      purposeScopeReference?: string;
      evidenceReferences: readonly string[];
    }>
  | Readonly<{
      kind: 'external_handoff';
      workspaceReference: string;
      handoffOptionReference: string;
      correlationReference: string;
      minimumBusinessIntentReference: string;
      purposeContextReference: string;
    }>
  | Readonly<{ kind: 'refresh_context'; workspaceReference: string; accountReference: string }>
  | Readonly<{ kind: 'retry'; workspaceReference: string; retryContext: string }>
  | Readonly<{
      kind: 'reconcile';
      workspaceReference: string;
      noticeReferences: readonly string[];
      policyApprovalContextReferences: readonly string[];
      supportCaseReferences: readonly string[];
      reconciliationContext: string;
    }>;

type AdminContextItem =
  | AdminAccountNotice
  | AdminPolicyApprovalContext
  | AdminSupportPrivacyCase
  | AdminExternalHandoffOption;

export interface AdminAccountNoticesExternalEscalationViewModel {
  readonly locale: SupportedLocale;
  readonly direction: TextDirection;
  readonly state: AdminAccountNoticesExternalEscalationState;
  readonly feedbackRole: AdminAccountNoticesExternalEscalationFeedbackRole;
  readonly feedbackTone: AdminAccountNoticesExternalEscalationFeedbackTone;
  readonly showContext: boolean;
  readonly handoffSelectionEnabled: boolean;
  readonly visibleIntents: readonly AdminAccountNoticesExternalEscalationIntentKind[];
  readonly consequence: 'local' | 'pending' | 'authoritative_final';
  readonly authoritativeFinal: boolean;
  readonly opaqueReferences: Readonly<{
    workspaceReference: string;
    accountReference: string;
    adminContextReferences: readonly string[];
    authorityStatusReference: string;
    lifecycleStatusReference: string;
    noticeReferences: readonly string[];
    disclosureVersionReferences: readonly string[];
    policyApprovalContextReferences: readonly string[];
    policyReferences: readonly string[];
    approvalReferences: readonly string[];
    supportCaseReferences: readonly string[];
    evidenceReferences: readonly string[];
    handoffOptionReferences: readonly string[];
    correlationReferences: readonly string[];
    selectedExternalHandoffOptionReference: string | undefined;
    orderingReferences: readonly string[];
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
  AdminAccountNoticesExternalEscalationState,
  {
    role: AdminAccountNoticesExternalEscalationFeedbackRole;
    tone: AdminAccountNoticesExternalEscalationFeedbackTone;
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
  AdminAccountNoticesExternalEscalationErrorCode,
  AdminAccountNoticesExternalEscalationState
>;

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function selectedHandoff(
  snapshot: AdminAccountNoticesExternalEscalationSnapshot,
): AdminExternalHandoffOption | undefined {
  return snapshot.externalHandoffOptions.find(
    (option) => option.optionReference === snapshot.selectedExternalHandoffOptionReference,
  );
}

function isInteractive(state: AdminAccountNoticesExternalEscalationState): boolean {
  return state === 'ready' || state === 'recovery';
}

export function mapAdminAccountNoticesExternalEscalationErrorCode(
  code: AdminAccountNoticesExternalEscalationErrorCode,
): AdminAccountNoticesExternalEscalationState {
  return stateByErrorCode[code];
}

export function isAdminAccountNoticesExternalEscalationIntentEnabled(
  state: AdminAccountNoticesExternalEscalationState,
  kind: AdminAccountNoticesExternalEscalationIntentKind,
  snapshot: AdminAccountNoticesExternalEscalationSnapshot,
  item?: AdminContextItem,
): boolean {
  const interactive = isInteractive(state);
  if (kind === 'review_admin_context') {
    return interactive && snapshot.adminContextReferences.length > 0;
  }
  if (kind === 'review_notice') {
    return interactive && item !== undefined && 'noticeReference' in item && item.reviewAvailable;
  }
  if (kind === 'review_policy_approval_context') {
    return interactive && item !== undefined && 'contextReference' in item && item.reviewAvailable;
  }
  if (kind === 'review_support_case') {
    return interactive && item !== undefined && 'caseReference' in item && item.reviewAvailable;
  }
  if (kind === 'external_handoff') {
    const option = selectedHandoff(snapshot);
    return interactive && option?.handoffAvailable === true;
  }
  if (kind === 'refresh_context') {
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
      state === 'lifecycle_conflict' ||
      state === 'duplicate_or_already_applied' ||
      state === 'recovery') &&
    hasValue(snapshot.reconciliationContext)
  );
}

export function createAdminAccountNoticesExternalEscalationIntent(
  kind: AdminAccountNoticesExternalEscalationIntentKind,
  snapshot: AdminAccountNoticesExternalEscalationSnapshot,
  item?: AdminContextItem,
): AdminAccountNoticesExternalEscalationIntent | undefined {
  if (kind === 'review_admin_context' && snapshot.adminContextReferences.length > 0) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      accountReference: snapshot.accountReference,
      adminContextReferences: Object.freeze([...snapshot.adminContextReferences]),
    });
  }
  if (
    kind === 'review_notice' &&
    item !== undefined &&
    'noticeReference' in item &&
    item.reviewAvailable
  ) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      noticeReference: item.noticeReference,
      ...(item.disclosureVersionReference === undefined
        ? {}
        : { disclosureVersionReference: item.disclosureVersionReference }),
    });
  }
  if (
    kind === 'review_policy_approval_context' &&
    item !== undefined &&
    'contextReference' in item &&
    item.reviewAvailable
  ) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      contextReference: item.contextReference,
      ...(item.subjectVersionReference === undefined
        ? {}
        : { subjectVersionReference: item.subjectVersionReference }),
      ...(item.policyReference === undefined ? {} : { policyReference: item.policyReference }),
      ...(item.approvalReference === undefined
        ? {}
        : { approvalReference: item.approvalReference }),
      evidenceReferences: Object.freeze([...item.evidenceReferences]),
    });
  }
  if (
    kind === 'review_support_case' &&
    item !== undefined &&
    'caseReference' in item &&
    item.reviewAvailable
  ) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      caseReference: item.caseReference,
      ...(item.purposeScopeReference === undefined
        ? {}
        : { purposeScopeReference: item.purposeScopeReference }),
      evidenceReferences: Object.freeze([...item.evidenceReferences]),
    });
  }
  const handoff = selectedHandoff(snapshot);
  if (kind === 'external_handoff' && handoff?.handoffAvailable === true) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      handoffOptionReference: handoff.optionReference,
      correlationReference: handoff.correlationReference,
      minimumBusinessIntentReference: handoff.minimumBusinessIntentReference,
      purposeContextReference: handoff.purposeContextReference,
    });
  }
  if (kind === 'refresh_context') {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      accountReference: snapshot.accountReference,
    });
  }
  if (kind === 'retry' && hasValue(snapshot.retryContext)) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      retryContext: snapshot.retryContext,
    });
  }
  if (kind === 'reconcile' && hasValue(snapshot.reconciliationContext)) {
    return Object.freeze({
      kind,
      workspaceReference: snapshot.workspaceReference,
      noticeReferences: Object.freeze(snapshot.notices.map((notice) => notice.noticeReference)),
      policyApprovalContextReferences: Object.freeze(
        snapshot.policyApprovalContexts.map((context) => context.contextReference),
      ),
      supportCaseReferences: Object.freeze(
        snapshot.supportPrivacyCases.map((caseItem) => caseItem.caseReference),
      ),
      reconciliationContext: snapshot.reconciliationContext,
    });
  }
  return undefined;
}

export function getAdminAccountNoticesExternalEscalationViewModel(
  locale: SupportedLocale,
  state: AdminAccountNoticesExternalEscalationState,
  snapshot: AdminAccountNoticesExternalEscalationSnapshot,
  visibility: AdminAccountNoticesExternalEscalationVisibility,
): AdminAccountNoticesExternalEscalationViewModel {
  const presentation = statePresentation[state];
  const contextItems: readonly AdminContextItem[] = [
    ...snapshot.notices,
    ...snapshot.policyApprovalContexts,
    ...snapshot.supportPrivacyCases,
    ...snapshot.externalHandoffOptions,
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
    feedbackRole: presentation.role,
    feedbackTone: presentation.tone,
    showContext: presentation.show && contextItems.length > 0,
    handoffSelectionEnabled:
      state === 'ready' || state === 'validation_error' || state === 'recovery',
    visibleIntents: Object.freeze(
      adminAccountNoticesExternalEscalationIntentKinds.filter((kind) => visibility[kind]),
    ),
    consequence,
    authoritativeFinal: state === 'authoritative_final',
    opaqueReferences: Object.freeze({
      workspaceReference: snapshot.workspaceReference,
      accountReference: snapshot.accountReference,
      adminContextReferences: Object.freeze([...snapshot.adminContextReferences]),
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      noticeReferences: Object.freeze(snapshot.notices.map((notice) => notice.noticeReference)),
      disclosureVersionReferences: Object.freeze(
        snapshot.notices.flatMap((notice) =>
          notice.disclosureVersionReference === undefined
            ? []
            : [notice.disclosureVersionReference],
        ),
      ),
      policyApprovalContextReferences: Object.freeze(
        snapshot.policyApprovalContexts.map((context) => context.contextReference),
      ),
      policyReferences: Object.freeze(
        snapshot.policyApprovalContexts.flatMap((context) =>
          context.policyReference === undefined ? [] : [context.policyReference],
        ),
      ),
      approvalReferences: Object.freeze(
        snapshot.policyApprovalContexts.flatMap((context) =>
          context.approvalReference === undefined ? [] : [context.approvalReference],
        ),
      ),
      supportCaseReferences: Object.freeze(
        snapshot.supportPrivacyCases.map((caseItem) => caseItem.caseReference),
      ),
      evidenceReferences: Object.freeze([
        ...snapshot.policyApprovalContexts.flatMap((context) => [...context.evidenceReferences]),
        ...snapshot.supportPrivacyCases.flatMap((caseItem) => [...caseItem.evidenceReferences]),
      ]),
      handoffOptionReferences: Object.freeze(
        snapshot.externalHandoffOptions.map((option) => option.optionReference),
      ),
      correlationReferences: Object.freeze(
        snapshot.externalHandoffOptions.map((option) => option.correlationReference),
      ),
      selectedExternalHandoffOptionReference: snapshot.selectedExternalHandoffOptionReference,
      orderingReferences: Object.freeze(contextItems.map((item) => item.orderingReference)),
    }),
  };
}
