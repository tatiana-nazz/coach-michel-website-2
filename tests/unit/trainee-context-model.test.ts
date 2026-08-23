import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createTraineeContextIntent,
  getTraineeContextViewModel,
  isTraineeContextIntentEnabled,
  mapTraineeContextErrorCode,
  traineeContextErrorCodes,
  traineeContextStates,
} from '@/features/coach/screens/scr-coa-003/trainee-context.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-003/trainee-context.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const summary = {
  summaryReference: 'SUMMARY::opaque/COA-003',
  category: 'completion',
  heading: 'Caller-supplied heading',
  statusLabel: 'Caller-supplied status',
  body: 'Caller-supplied body',
  reviewAvailable: true,
} as const;

const snapshot = {
  traineeReference: 'TRAINEE::opaque/COA-003',
  authorityStatusReference: 'AUTHORITY::opaque/COA-003',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-003',
  boundedTimeContext: 'TIME::bounded/COA-003',
  summaries: [summary],
  evidenceReferences: ['EVIDENCE::opaque/COA-003'],
  recoveryContext: {
    retryContext: 'RETRY::opaque/COA-003',
    reconciliationContext: 'RECONCILE::opaque/COA-003',
  },
} as const;

const visibility = {
  review_context_item: true,
  refresh_context: true,
  retry: false,
  reconcile: true,
} as const;

describe('SCR-COA-003 trainee context model', () => {
  it('preserves the exact context error mapping and governed state distinctions', () => {
    expect(traineeContextStates).toContain('empty');
    expect(traineeContextStates).toContain('duplicate_or_already_applied');
    expect(traineeContextStates).toContain('pending');
    expect(traineeContextStates).toContain('authoritative_final');
    expect(traineeContextErrorCodes).toEqual([
      'AUTHENTICATION_REQUIRED_OR_INVALID',
      'AUTHORITY_DENIED',
      'DEPENDENCY_UNAVAILABLE',
      'RATE_LIMITED',
      'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
      'STALE_OR_CONFLICTING_STATE',
    ]);
    expect(mapTraineeContextErrorCode('RESOURCE_NOT_FOUND_OR_UNAVAILABLE')).toBe(
      'resource_not_found_or_unavailable',
    );
  });

  it('preserves opaque trainee, summary, and evidence references without interpretation', () => {
    const viewModel = getTraineeContextViewModel('ar', 'ready', snapshot, visibility);
    const review = createTraineeContextIntent('review_context_item', snapshot, summary);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences).toEqual({
      traineeReference: snapshot.traineeReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      lifecycleStatusReference: snapshot.lifecycleStatusReference,
      summaryReferences: [summary.summaryReference],
      evidenceReferences: snapshot.evidenceReferences,
    });
    expect(review).toEqual({
      kind: 'review_context_item',
      traineeReference: snapshot.traineeReference,
      summaryReference: summary.summaryReference,
      category: summary.category,
    });
  });

  it('constructs bounded context/reconciliation intents and gates them by explicit state', () => {
    expect(createTraineeContextIntent('refresh_context', snapshot)).toEqual({
      kind: 'refresh_context',
      traineeReference: snapshot.traineeReference,
      boundedTimeContext: snapshot.boundedTimeContext,
    });
    expect(createTraineeContextIntent('reconcile', snapshot)).toEqual({
      kind: 'reconcile',
      traineeReference: snapshot.traineeReference,
      evidenceReferences: snapshot.evidenceReferences,
      reconciliationContext: snapshot.recoveryContext.reconciliationContext,
    });
    expect(isTraineeContextIntentEnabled('ready', 'review_context_item', snapshot, summary)).toBe(
      true,
    );
    expect(isTraineeContextIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(isTraineeContextIntentEnabled('pending', 'refresh_context', snapshot)).toBe(false);
  });

  it('does not accept coach scope or infer transport, routing, persistence, or durable success', () => {
    expect(getTraineeContextViewModel('en', 'ready', snapshot, visibility).authoritativeFinal).toBe(
      false,
    );
    expect(modelSource).not.toContain('coach_scope');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
