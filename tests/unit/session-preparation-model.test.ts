import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createSessionPreparationIntent,
  getSessionPreparationViewModel,
  isSessionPreparationIntentEnabled,
  mapSessionPreparationErrorCode,
  sessionPreparationErrorCodes,
  sessionPreparationStates,
} from '@/features/coach/screens/scr-coa-005/session-preparation.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-005/session-preparation.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const step = {
  sequenceReference: 'SEQUENCE::opaque/COA-005',
  orderingReference: 'ORDER::sequence/COA-005',
  heading: 'Caller-supplied step',
  statusLabel: 'Caller-supplied status',
  body: 'Caller-supplied body',
} as const;

const exercise = {
  exerciseReference: 'EXERCISE::opaque/COA-005',
  orderingReference: 'ORDER::exercise/COA-005',
  contentDraftReference: 'CONTENT-DRAFT::opaque/COA-005',
  guidanceReference: 'GUIDANCE::opaque/exercise-COA-005',
  displayLabel: 'Caller-supplied exercise',
  approvalStatusLabel: 'Caller-supplied approval status',
  summary: 'Caller-supplied summary',
  reviewAvailable: true,
} as const;

const guidance = {
  guidanceReference: 'GUIDANCE::opaque/COA-005',
  heading: 'Caller-supplied guidance',
  body: 'Caller-supplied guidance body',
} as const;

const snapshot = {
  traineeReference: 'TRAINEE::opaque/COA-005',
  sessionReference: 'SESSION::opaque/COA-005',
  programReference: 'PROGRAM::opaque/COA-005',
  sessionDraftReference: 'SESSION-DRAFT::opaque/COA-005',
  draftVersionReference: 'VERSION::opaque/COA-005',
  preparationIntentReference: 'INTENT::opaque/COA-005',
  authorityStatusReference: 'AUTHORITY::opaque/COA-005',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-005',
  boundedTimeContext: 'TIME::bounded/COA-005',
  sequence: [step],
  exercises: [exercise],
  guidance: [guidance],
  evidenceReferences: ['EVIDENCE::opaque/COA-005'],
  auditReferences: ['AUDIT::opaque/COA-005'],
  draftIntentAvailable: true,
  recoveryContext: {
    retryContext: 'RETRY::opaque/COA-005',
    reconciliationContext: 'RECONCILE::opaque/COA-005',
  },
} as const;

const visibility = {
  review_exercise: true,
  prepare_session_draft_intent: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-005 session preparation model', () => {
  it('preserves the exact mapped errors and context-action state distinctions', () => {
    expect(sessionPreparationStates).toContain('empty');
    expect(sessionPreparationStates).toContain('lifecycle_conflict');
    expect(sessionPreparationStates).toContain('duplicate_or_already_applied');
    expect(sessionPreparationStates).toContain('pending');
    expect(sessionPreparationStates).toContain('authoritative_final');
    expect(sessionPreparationErrorCodes).toEqual([
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
    expect(mapSessionPreparationErrorCode('RESOURCE_NOT_FOUND')).toBe('resource_not_found');
    expect(mapSessionPreparationErrorCode('VALIDATION_FAILED')).toBe('validation_error');
  });

  it('preserves trainee, session, draft, exercise, guidance, evidence, and audit references exactly', () => {
    const viewModel = getSessionPreparationViewModel('ar', 'ready', snapshot, visibility);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.traineeReference).toBe(snapshot.traineeReference);
    expect(viewModel.opaqueReferences.sessionReference).toBe(snapshot.sessionReference);
    expect(viewModel.opaqueReferences.sessionDraftReference).toBe(snapshot.sessionDraftReference);
    expect(viewModel.opaqueReferences.exerciseReferences).toEqual([exercise.exerciseReference]);
    expect(viewModel.opaqueReferences.guidanceReferences).toEqual([
      guidance.guidanceReference,
      exercise.guidanceReference,
    ]);
    expect(viewModel.opaqueReferences.evidenceReferences).toEqual(snapshot.evidenceReferences);
    expect(viewModel.opaqueReferences.auditReferences).toEqual(snapshot.auditReferences);
  });

  it('constructs review, draft, refresh, retry, and reconciliation semantic intents only', () => {
    expect(createSessionPreparationIntent('review_exercise', snapshot, exercise)).toEqual({
      kind: 'review_exercise',
      traineeReference: snapshot.traineeReference,
      sessionReference: snapshot.sessionReference,
      exerciseReference: exercise.exerciseReference,
      contentDraftReference: exercise.contentDraftReference,
      guidanceReference: exercise.guidanceReference,
    });
    expect(createSessionPreparationIntent('prepare_session_draft_intent', snapshot)).toEqual({
      kind: 'prepare_session_draft_intent',
      traineeReference: snapshot.traineeReference,
      sessionReference: snapshot.sessionReference,
      sessionDraftReference: snapshot.sessionDraftReference,
      draftVersionReference: snapshot.draftVersionReference,
      preparationIntentReference: snapshot.preparationIntentReference,
      exerciseReferences: [exercise.exerciseReference],
    });
    expect(createSessionPreparationIntent('refresh_context', snapshot)).toEqual({
      kind: 'refresh_context',
      traineeReference: snapshot.traineeReference,
      sessionReference: snapshot.sessionReference,
      boundedTimeContext: snapshot.boundedTimeContext,
    });
    expect(isSessionPreparationIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(isSessionPreparationIntentEnabled('pending', 'refresh_context', snapshot)).toBe(false);
  });

  it('does not accept authoritative coach scope or infer transport, routing, persistence, or success', () => {
    expect(
      getSessionPreparationViewModel('en', 'ready', snapshot, visibility).authoritativeFinal,
    ).toBe(false);
    expect(modelSource).not.toContain('coach_scope');
    expect(modelSource).not.toContain('coach_content_scope');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
