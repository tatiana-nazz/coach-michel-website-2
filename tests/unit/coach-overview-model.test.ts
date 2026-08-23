import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  coachOverviewErrorCodes,
  coachOverviewStates,
  createCoachOverviewIntent,
  getCoachOverviewViewModel,
  isCoachOverviewIntentEnabled,
  mapCoachOverviewErrorCode,
} from '@/features/coach/screens/scr-coa-001/coach-overview.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-001/coach-overview.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const summary = {
  summaryReference: 'SUMMARY::opaque/COA-001',
  category: 'monitoring',
  heading: 'Caller-supplied heading',
  statusLabel: 'Caller-supplied status',
  body: 'Caller-supplied body',
  nextActionLabel: 'Caller-supplied action',
  reviewAvailable: true,
} as const;

const snapshot = {
  overviewStatusReference: 'OVERVIEW::opaque/COA-001',
  authorityStatusReference: 'AUTHORITY::opaque/COA-001',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-001',
  summaries: [summary],
  timeWindowContext: 'TIME-WINDOW::bounded/COA-001',
  filterOptions: [{ filterReference: 'FILTER::allowlisted/1', label: 'Caller filter' }],
  selectedFilterReferences: ['FILTER::allowlisted/1'],
  projectionContext: {
    affectedProjectionReference: 'PROJECTION::opaque/COA-001',
    sourceEvidenceReferences: ['EVIDENCE::opaque/COA-001'],
    retryContext: 'RETRY::opaque/COA-001',
  },
} as const;

const visibility = {
  review_summary: true,
  refresh_overview: true,
  request_projection_reconciliation: false,
  retry: true,
} as const;

describe('SCR-COA-001 coach overview model', () => {
  it('preserves exact governed states and mapped error vocabulary', () => {
    expect(coachOverviewStates).toContain('empty');
    expect(coachOverviewStates).toContain('pending');
    expect(coachOverviewStates).toContain('authoritative_final');
    expect(coachOverviewErrorCodes).toEqual([
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
    expect(mapCoachOverviewErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
    expect(mapCoachOverviewErrorCode('VALIDATION_FAILED')).toBe('validation_error');
  });

  it('preserves caller-fed filters, summaries, and projection evidence exactly', () => {
    const viewModel = getCoachOverviewViewModel('ar', 'ready', snapshot, visibility);
    const review = createCoachOverviewIntent('review_summary', snapshot, summary);
    const refresh = createCoachOverviewIntent('refresh_overview', snapshot);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.visibleIntents).toEqual(['review_summary', 'refresh_overview', 'retry']);
    expect(viewModel.opaqueReferences.summaryReferences).toEqual([summary.summaryReference]);
    expect(viewModel.opaqueReferences.sourceEvidenceReferences).toEqual(
      snapshot.projectionContext.sourceEvidenceReferences,
    );
    expect(review).toEqual({
      kind: 'review_summary',
      summaryReference: summary.summaryReference,
      category: summary.category,
    });
    expect(refresh).toEqual({
      kind: 'refresh_overview',
      selectedFilterReferences: snapshot.selectedFilterReferences,
      timeWindowContext: snapshot.timeWindowContext,
    });
  });

  it('gates semantic actions by caller state and bounded context', () => {
    expect(isCoachOverviewIntentEnabled('ready', 'review_summary', snapshot, summary)).toBe(true);
    expect(isCoachOverviewIntentEnabled('pending', 'review_summary', snapshot, summary)).toBe(
      false,
    );
    expect(isCoachOverviewIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(
      isCoachOverviewIntentEnabled(
        'stale_or_conflicting_state',
        'request_projection_reconciliation',
        snapshot,
      ),
    ).toBe(true);
  });

  it('does not accept coach authority or infer transport, routing, storage, or durable success', () => {
    expect(getCoachOverviewViewModel('en', 'ready', snapshot, visibility).authoritativeFinal).toBe(
      false,
    );
    expect(
      getCoachOverviewViewModel('en', 'authoritative_final', snapshot, visibility)
        .authoritativeFinal,
    ).toBe(true);
    expect(modelSource).not.toContain('coach_role_scope');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
