import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  adminAccountNoticesExternalEscalationErrorCodes,
  adminAccountNoticesExternalEscalationIntentKinds,
  adminAccountNoticesExternalEscalationStates,
  createAdminAccountNoticesExternalEscalationIntent,
  getAdminAccountNoticesExternalEscalationViewModel,
  isAdminAccountNoticesExternalEscalationIntentEnabled,
  mapAdminAccountNoticesExternalEscalationErrorCode,
} from '@/features/coach/screens/scr-coa-010/admin-account-notices-external-escalation.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-010/admin-account-notices-external-escalation.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const notice = {
  orderingReference: 'ORDER-NOTICE::opaque/COA-010',
  noticeReference: 'NOTICE::opaque/COA-010',
  disclosureVersionReference: 'DISCLOSURE-VERSION::opaque/COA-010',
  effectiveTimeContext: 'EFFECTIVE-TIME::authoritative/COA-010',
  heading: 'Caller notice heading',
  body: 'Caller notice body',
  statusLabel: 'Caller notice status',
  reviewAvailable: true,
} as const;
const policyContext = {
  orderingReference: 'ORDER-POLICY::opaque/COA-010',
  contextReference: 'POLICY-CONTEXT::opaque/COA-010',
  subjectVersionReference: 'SUBJECT-VERSION::opaque/COA-010',
  policyReference: 'POLICY::opaque/COA-010',
  approvalReference: 'APPROVAL::opaque/COA-010',
  evidenceReferences: ['POLICY-EVIDENCE::opaque/COA-010'],
  heading: 'Caller policy heading',
  statusLabel: 'Caller policy status',
  summary: 'Caller policy summary',
  reviewAvailable: true,
} as const;
const supportCase = {
  orderingReference: 'ORDER-CASE::opaque/COA-010',
  caseReference: 'CASE::opaque/COA-010',
  purposeScopeReference: 'PURPOSE-SCOPE::opaque/COA-010',
  evidenceReferences: ['CASE-EVIDENCE::opaque/COA-010'],
  heading: 'Caller case heading',
  statusLabel: 'Caller case status',
  summary: 'Caller case summary',
  reviewAvailable: true,
} as const;
const handoff = {
  orderingReference: 'ORDER-HANDOFF::opaque/COA-010',
  optionReference: 'HANDOFF-OPTION::opaque/COA-010',
  correlationReference: 'CORRELATION::opaque/COA-010',
  minimumBusinessIntentReference: 'BUSINESS-INTENT::opaque/COA-010',
  purposeContextReference: 'HANDOFF-PURPOSE::opaque/COA-010',
  label: 'Caller handoff option',
  description: 'Caller handoff description',
  consequence: 'Caller handoff consequence',
  handoffAvailable: true,
} as const;
const snapshot = {
  workspaceReference: 'WORKSPACE::opaque/COA-010',
  accountReference: 'ACCOUNT::opaque/COA-010',
  adminContextReferences: ['ADMIN-CONTEXT::opaque/COA-010'],
  authorityStatusReference: 'AUTHORITY::opaque/COA-010',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-010',
  notices: [notice],
  policyApprovalContexts: [policyContext],
  supportPrivacyCases: [supportCase],
  externalHandoffOptions: [handoff],
  selectedExternalHandoffOptionReference: handoff.optionReference,
  retryContext: 'RETRY::opaque/COA-010',
  reconciliationContext: 'RECONCILE::opaque/COA-010',
} as const;
const visibility = {
  review_admin_context: true,
  review_notice: true,
  review_policy_approval_context: true,
  review_support_case: true,
  external_handoff: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-010 admin account, notices, and external escalation model', () => {
  it('preserves the exact errors and account-notice-external-handoff state distinctions', () => {
    expect(adminAccountNoticesExternalEscalationStates).toContain('empty');
    expect(adminAccountNoticesExternalEscalationStates).toContain('pending');
    expect(adminAccountNoticesExternalEscalationStates).toContain('authoritative_final');
    expect(adminAccountNoticesExternalEscalationErrorCodes).toEqual([
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
    ]);
    expect(mapAdminAccountNoticesExternalEscalationErrorCode('VALIDATION_FAILED')).toBe(
      'validation_error',
    );
  });

  it('preserves admin, notice, policy, approval, case, evidence, and handoff references exactly', () => {
    const viewModel = getAdminAccountNoticesExternalEscalationViewModel(
      'ar',
      'ready',
      snapshot,
      visibility,
    );
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.adminContextReferences).toEqual(
      snapshot.adminContextReferences,
    );
    expect(viewModel.opaqueReferences.noticeReferences).toEqual([notice.noticeReference]);
    expect(viewModel.opaqueReferences.policyReferences).toEqual([policyContext.policyReference]);
    expect(viewModel.opaqueReferences.approvalReferences).toEqual([
      policyContext.approvalReference,
    ]);
    expect(viewModel.opaqueReferences.supportCaseReferences).toEqual([supportCase.caseReference]);
    expect(viewModel.opaqueReferences.correlationReferences).toEqual([
      handoff.correlationReference,
    ]);
  });

  it('constructs review-only and approved handoff semantic intents with capability gating', () => {
    expect(
      createAdminAccountNoticesExternalEscalationIntent(
        'review_policy_approval_context',
        snapshot,
        policyContext,
      ),
    ).toEqual({
      kind: 'review_policy_approval_context',
      workspaceReference: snapshot.workspaceReference,
      contextReference: policyContext.contextReference,
      subjectVersionReference: policyContext.subjectVersionReference,
      policyReference: policyContext.policyReference,
      approvalReference: policyContext.approvalReference,
      evidenceReferences: policyContext.evidenceReferences,
    });
    expect(createAdminAccountNoticesExternalEscalationIntent('external_handoff', snapshot)).toEqual(
      {
        kind: 'external_handoff',
        workspaceReference: snapshot.workspaceReference,
        handoffOptionReference: handoff.optionReference,
        correlationReference: handoff.correlationReference,
        minimumBusinessIntentReference: handoff.minimumBusinessIntentReference,
        purposeContextReference: handoff.purposeContextReference,
      },
    );
    expect(
      isAdminAccountNoticesExternalEscalationIntentEnabled('pending', 'external_handoff', snapshot),
    ).toBe(false);
    expect(
      isAdminAccountNoticesExternalEscalationIntentEnabled('rate_limited', 'retry', snapshot),
    ).toBe(true);
    expect(adminAccountNoticesExternalEscalationIntentKinds).not.toContain('mutate_case');
  });

  it('does not sort, infer authority, mutate approval/cases, upload, persist, route, or select adapters', () => {
    expect(modelSource).not.toContain('.sort(');
    expect(modelSource).not.toContain('.toSorted(');
    expect(modelSource).not.toContain('administrator_approver_role');
    expect(modelSource).not.toContain('approval_decision');
    expect(modelSource).not.toContain('FormData');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('providerClient');
  });
});
