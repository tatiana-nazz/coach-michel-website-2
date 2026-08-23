import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createSchedulingReleaseIntent,
  getSchedulingReleaseViewModel,
  isSchedulingReleaseIntentEnabled,
  mapSchedulingReleaseErrorCode,
  schedulingReleaseErrorCodes,
  schedulingReleaseStates,
} from '@/features/coach/screens/scr-coa-007/scheduling-release.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-007/scheduling-release.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  workspaceReference: 'WORKSPACE::opaque/COA-007',
  subjectScopeReference: 'SUBJECT::opaque/COA-007',
  traineeScopeReference: 'TRAINEE::opaque/COA-007',
  definitionVersionReferences: ['DEFINITION-VERSION::opaque/COA-007'],
  schedulePreviewReference: 'PREVIEW::opaque/COA-007',
  scheduleReleaseIntentReference: 'RELEASE-INTENT::opaque/COA-007',
  authoritativeCoachingTimeContext: 'COACHING-TIME::authoritative/COA-007',
  effectiveTimeContext: 'EFFECTIVE-TIME::authoritative/COA-007',
  reason: { categoryLabel: 'Caller category', rationale: 'Caller rationale' },
  policyReference: 'POLICY::opaque/COA-007',
  evidenceReferences: ['EVIDENCE::opaque/COA-007'],
  authorityStatusReference: 'AUTHORITY::opaque/COA-007',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-007',
  retryContext: 'RETRY::opaque/COA-007',
  reconciliationContext: 'RECONCILE::opaque/COA-007',
} as const;

const visibility = {
  review_preview: true,
  submit_release_intent: true,
  review_policy_context: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-007 scheduling and release model', () => {
  it('preserves the exact error mapping and governed state distinctions', () => {
    expect(schedulingReleaseStates).toContain('empty');
    expect(schedulingReleaseStates).toContain('pending');
    expect(schedulingReleaseStates).toContain('authoritative_final');
    expect(schedulingReleaseErrorCodes).toEqual([
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
    expect(mapSchedulingReleaseErrorCode('VALIDATION_FAILED')).toBe('validation_error');
    expect(mapSchedulingReleaseErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });

  it('preserves subject, definition, preview, policy, evidence, and lifecycle references exactly', () => {
    const viewModel = getSchedulingReleaseViewModel('ar', 'ready', snapshot, visibility);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.subjectScopeReference).toBe(snapshot.subjectScopeReference);
    expect(viewModel.opaqueReferences.definitionVersionReferences).toEqual(
      snapshot.definitionVersionReferences,
    );
    expect(viewModel.opaqueReferences.schedulePreviewReference).toBe(
      snapshot.schedulePreviewReference,
    );
    expect(viewModel.opaqueReferences.policyReference).toBe(snapshot.policyReference);
    expect(viewModel.opaqueReferences.evidenceReferences).toEqual(snapshot.evidenceReferences);
  });

  it('constructs caller-owned preview, release, policy, retry, and reconciliation intents', () => {
    expect(createSchedulingReleaseIntent('submit_release_intent', snapshot)).toEqual({
      kind: 'submit_release_intent',
      workspaceReference: snapshot.workspaceReference,
      subjectScopeReference: snapshot.subjectScopeReference,
      traineeScopeReference: snapshot.traineeScopeReference,
      definitionVersionReferences: snapshot.definitionVersionReferences,
      scheduleReleaseIntentReference: snapshot.scheduleReleaseIntentReference,
      authoritativeCoachingTimeContext: snapshot.authoritativeCoachingTimeContext,
      effectiveTimeContext: snapshot.effectiveTimeContext,
      reason: snapshot.reason,
      evidenceReferences: snapshot.evidenceReferences,
    });
    expect(createSchedulingReleaseIntent('review_policy_context', snapshot)).toEqual({
      kind: 'review_policy_context',
      workspaceReference: snapshot.workspaceReference,
      policyReference: snapshot.policyReference,
    });
    expect(isSchedulingReleaseIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(isSchedulingReleaseIntentEnabled('pending', 'submit_release_intent', snapshot)).toBe(
      false,
    );
  });

  it('does not infer time, actor scope, approval, transport, persistence, routes, or provider behavior', () => {
    expect(modelSource).not.toContain('new Date');
    expect(modelSource).not.toContain('authorized_actor_system_principal');
    expect(modelSource).not.toContain('approval_decision');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('providerClient');
  });
});
