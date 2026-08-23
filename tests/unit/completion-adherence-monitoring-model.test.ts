import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  completionAdherenceMonitoringErrorCodes,
  completionAdherenceMonitoringStates,
  createCompletionAdherenceMonitoringIntent,
  getCompletionAdherenceMonitoringViewModel,
  isCompletionAdherenceMonitoringIntentEnabled,
  mapCompletionAdherenceMonitoringErrorCode,
} from '@/features/coach/screens/scr-coa-008/completion-adherence-monitoring.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-008/completion-adherence-monitoring.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const option = { optionReference: 'OPTION::allowlisted/COA-008', label: 'Caller option' } as const;
const item = {
  orderingReference: 'ORDER::opaque/COA-008',
  traineeReference: 'TRAINEE::opaque/COA-008',
  scheduleReference: 'SCHEDULE::opaque/COA-008',
  completionReference: 'COMPLETION::opaque/COA-008',
  definitionVersionReference: 'VERSION::opaque/COA-008',
  evidenceReferences: ['EVIDENCE::opaque/COA-008'],
  displayLabel: 'Caller item',
  scheduleStatusLabel: 'Caller schedule status',
  completionStatusLabel: 'Caller completion status',
  adherenceStatusLabel: 'Caller adherence status',
  authoritativeTimeLabel: 'Caller authoritative time',
  projectionStatusLabel: 'Caller projection status',
  summary: 'Caller summary',
  reviewAvailable: true,
} as const;
const snapshot = {
  monitoringReference: 'MONITORING::opaque/COA-008',
  authoritativeTimeContext: 'TIME::authoritative/COA-008',
  projectionReference: 'PROJECTION::opaque/COA-008',
  authorityStatusReference: 'AUTHORITY::opaque/COA-008',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-008',
  items: [item],
  statusFilterOptions: [option],
  selectedStatusFilterReference: option.optionReference,
  sortOptions: [option],
  selectedSortReference: option.optionReference,
  retryContext: 'RETRY::opaque/COA-008',
  reconciliationContext: 'RECONCILE::opaque/COA-008',
} as const;
const visibility = {
  review_item: true,
  refresh_monitoring: true,
  request_projection_refresh_intent: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-008 completion and adherence monitoring model', () => {
  it('preserves exact error mappings and monitoring/reconciliation states', () => {
    expect(completionAdherenceMonitoringStates).toContain('empty');
    expect(completionAdherenceMonitoringStates).toContain('pending');
    expect(completionAdherenceMonitoringStates).toContain('recovery');
    expect(completionAdherenceMonitoringErrorCodes).toEqual([
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
    expect(mapCompletionAdherenceMonitoringErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
  });

  it('preserves collection order and trainee, schedule, completion, version, and evidence references', () => {
    const viewModel = getCompletionAdherenceMonitoringViewModel(
      'ar',
      'ready',
      snapshot,
      visibility,
    );
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.traineeReferences).toEqual([item.traineeReference]);
    expect(viewModel.opaqueReferences.scheduleReferences).toEqual([item.scheduleReference]);
    expect(viewModel.opaqueReferences.completionReferences).toEqual([item.completionReference]);
    expect(viewModel.opaqueReferences.definitionVersionReferences).toEqual([
      item.definitionVersionReference,
    ]);
    expect(viewModel.opaqueReferences.evidenceReferences).toEqual(item.evidenceReferences);
  });

  it('constructs review, bounded refresh, projection-request, retry, and reconciliation intents', () => {
    expect(createCompletionAdherenceMonitoringIntent('review_item', snapshot, item)).toEqual({
      kind: 'review_item',
      monitoringReference: snapshot.monitoringReference,
      traineeReference: item.traineeReference,
      scheduleReference: item.scheduleReference,
      completionReference: item.completionReference,
      evidenceReferences: item.evidenceReferences,
    });
    expect(
      createCompletionAdherenceMonitoringIntent('request_projection_refresh_intent', snapshot),
    ).toEqual({
      kind: 'request_projection_refresh_intent',
      monitoringReference: snapshot.monitoringReference,
      projectionReference: snapshot.projectionReference,
      evidenceReferences: item.evidenceReferences,
    });
    expect(isCompletionAdherenceMonitoringIntentEnabled('rate_limited', 'retry', snapshot)).toBe(
      true,
    );
    expect(
      isCompletionAdherenceMonitoringIntentEnabled(
        'pending',
        'request_projection_refresh_intent',
        snapshot,
      ),
    ).toBe(false);
  });

  it('does not sort, infer coach scope, treat projection as authority, or select transport', () => {
    expect(modelSource).not.toContain('.sort(');
    expect(modelSource).not.toContain('.toSorted(');
    expect(modelSource).not.toContain('coach_scope');
    expect(modelSource).not.toContain('projectionIsAuthoritative');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
