import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  correctionReconciliationReviewErrorCodes,
  correctionReconciliationReviewStates,
  createCorrectionReconciliationReviewIntent,
  getCorrectionReconciliationReviewViewModel,
  isCorrectionReconciliationReviewIntentEnabled,
  mapCorrectionReconciliationReviewErrorCode,
} from '@/features/coach/screens/scr-coa-009/correction-reconciliation-review.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-009/correction-reconciliation-review.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const item = {
  orderingReference: 'ORDER::opaque/COA-009',
  caseReference: 'CASE::opaque/COA-009',
  proposalReference: 'PROPOSAL::opaque/COA-009',
  affectedSubjectReferences: ['SUBJECT::opaque/COA-009'],
  scheduleReferences: ['SCHEDULE::opaque/COA-009'],
  evidenceReferences: ['EVIDENCE::opaque/COA-009'],
  reasonCategoryLabel: 'Caller reason category',
  reasonVersionReference: 'REASON-VERSION::opaque/COA-009',
  decisionReference: 'DECISION::opaque/COA-009',
  separationExceptionEvidenceReferences: ['EXCEPTION::opaque/COA-009'],
  incidentRecoveryReferences: ['INCIDENT::opaque/COA-009'],
  auditReferences: ['AUDIT::opaque/COA-009'],
  displayLabel: 'Caller case',
  statusLabel: 'Caller status',
  proposalStatusLabel: 'Caller proposal status',
  decisionStatusLabel: 'Caller decision status',
  summary: 'Caller summary',
  reviewAvailable: true,
  proposalIntentAvailable: true,
  decisionIntentAvailable: true,
  auditReviewAvailable: true,
} as const;
const snapshot = {
  reviewReference: 'REVIEW::opaque/COA-009',
  authorityStatusReference: 'AUTHORITY::opaque/COA-009',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-009',
  boundedAuditTimeContext: 'AUDIT-TIME::bounded/COA-009',
  continuationContext: 'CONTINUATION::opaque/COA-009',
  cases: [item],
  retryContext: 'RETRY::opaque/COA-009',
  reconciliationContext: 'RECONCILE::opaque/COA-009',
} as const;
const visibility = {
  review_case: true,
  prepare_proposal_intent: true,
  prepare_decision_intent: true,
  review_audit_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-009 correction and reconciliation review model', () => {
  it('preserves exact error mappings and conflict/reconciliation state distinctions', () => {
    expect(correctionReconciliationReviewStates).toContain('validation_error');
    expect(correctionReconciliationReviewStates).toContain('duplicate_or_already_applied');
    expect(correctionReconciliationReviewStates).toContain('pending');
    expect(correctionReconciliationReviewErrorCodes).toEqual([
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
    expect(mapCorrectionReconciliationReviewErrorCode('LIFECYCLE_CONFLICT')).toBe(
      'lifecycle_conflict',
    );
  });

  it('preserves case, proposal, subject, schedule, evidence, decision, exception, incident, and audit references', () => {
    const viewModel = getCorrectionReconciliationReviewViewModel(
      'ar',
      'ready',
      snapshot,
      visibility,
    );
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.caseReferences).toEqual([item.caseReference]);
    expect(viewModel.opaqueReferences.proposalReferences).toEqual([item.proposalReference]);
    expect(viewModel.opaqueReferences.affectedSubjectReferences).toEqual(
      item.affectedSubjectReferences,
    );
    expect(viewModel.opaqueReferences.decisionReferences).toEqual([item.decisionReference]);
    expect(viewModel.opaqueReferences.separationExceptionEvidenceReferences).toEqual(
      item.separationExceptionEvidenceReferences,
    );
    expect(viewModel.opaqueReferences.incidentRecoveryReferences).toEqual(
      item.incidentRecoveryReferences,
    );
    expect(viewModel.opaqueReferences.auditReferences).toEqual(item.auditReferences);
  });

  it('constructs proposal, decision, audit-review, retry, and reconciliation intents only', () => {
    expect(
      createCorrectionReconciliationReviewIntent('prepare_decision_intent', snapshot, item),
    ).toEqual({
      kind: 'prepare_decision_intent',
      reviewReference: snapshot.reviewReference,
      caseReference: item.caseReference,
      proposalReference: item.proposalReference,
      decisionReference: item.decisionReference,
      separationExceptionEvidenceReferences: item.separationExceptionEvidenceReferences,
    });
    expect(
      createCorrectionReconciliationReviewIntent('review_audit_context', snapshot, item),
    ).toEqual({
      kind: 'review_audit_context',
      reviewReference: snapshot.reviewReference,
      caseReference: item.caseReference,
      auditReferences: item.auditReferences,
      boundedAuditTimeContext: snapshot.boundedAuditTimeContext,
      continuationContext: snapshot.continuationContext,
    });
    expect(isCorrectionReconciliationReviewIntentEnabled('rate_limited', 'retry', snapshot)).toBe(
      true,
    );
    expect(
      isCorrectionReconciliationReviewIntentEnabled(
        'pending',
        'prepare_decision_intent',
        snapshot,
        item,
      ),
    ).toBe(false);
  });

  it('does not infer authorizer scope, execute correction, upload, persist, route, or transport', () => {
    expect(modelSource).not.toContain('authorizer_role_scope');
    expect(modelSource).not.toContain('correctionExecuted');
    expect(modelSource).not.toContain('FormData');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
