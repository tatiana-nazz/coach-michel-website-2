import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createAvailableSessionOverviewIntent,
  getAvailableSessionOverviewViewModel,
  isAvailableSessionOverviewIntentEnabled,
  mapAvailableSessionOverviewErrorCode,
} from '@/features/trainee/screens/scr-trn-002/available-session-overview.model';

const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-002/available-session-overview.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const work = {
  workReference: 'WORK::opaque/002',
  heading: 'Caller work',
  description: 'Caller description',
  statusLabel: 'Caller status',
  availableForIntent: true,
} as const;
const snapshot = {
  sessionReference: 'SESSION::opaque/002',
  sessionHeading: 'Caller session',
  sessionStatus: 'Caller status',
  sessionSummary: 'Caller summary',
  approvedWork: [work],
} as const;
const recovery = {
  retryContext: 'RETRY::opaque/002',
  reconciliationContext: 'RECONCILE::opaque/002',
} as const;
const visibility = { request_approved_work: true, retry: false, reconcile: false } as const;

describe('SCR-TRN-002 available session overview model', () => {
  it('maps source-supported errors without collapsing authority and availability', () => {
    expect(mapAvailableSessionOverviewErrorCode('AUTHENTICATION_REQUIRED_OR_INVALID')).toBe(
      'authentication_required',
    );
    expect(mapAvailableSessionOverviewErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapAvailableSessionOverviewErrorCode('RESOURCE_NOT_FOUND_OR_UNAVAILABLE')).toBe(
      'resource_not_found_or_unavailable',
    );
    expect(mapAvailableSessionOverviewErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });
  it('preserves opaque session/work order and references exactly', () => {
    const model = getAvailableSessionOverviewViewModel(
      'ar',
      'ready',
      snapshot,
      work.workReference,
      visibility,
      recovery,
    );
    const intent = createAvailableSessionOverviewIntent(
      'request_approved_work',
      snapshot,
      work,
      recovery,
    );
    expect(model.direction).toBe('rtl');
    expect(model.opaqueReferences.sessionReference).toBe(snapshot.sessionReference);
    expect(model.opaqueReferences.workReferences).toEqual([work.workReference]);
    expect(intent).toEqual({
      kind: 'request_approved_work',
      sessionReference: snapshot.sessionReference,
      workReference: work.workReference,
    });
  });
  it('keeps caller selection and local intent distinct from durable completion', () => {
    expect(
      isAvailableSessionOverviewIntentEnabled('ready', 'request_approved_work', work, recovery),
    ).toBe(true);
    expect(
      isAvailableSessionOverviewIntentEnabled('pending', 'request_approved_work', work, recovery),
    ).toBe(false);
    expect(
      getAvailableSessionOverviewViewModel('en', 'ready', snapshot, work.workReference, visibility)
        .durableFinal,
    ).toBe(false);
    expect(
      getAvailableSessionOverviewViewModel(
        'en',
        'durable_final',
        snapshot,
        work.workReference,
        visibility,
      ).durableFinal,
    ).toBe(true);
  });
  it('does not parse opaque references or add actor, route, transport, or storage behavior', () => {
    expect(source).not.toContain('.split(');
    expect(source).not.toContain('trainee_context');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('browserApiClient');
    expect(source).not.toContain('operationRegistry');
    expect(source).not.toContain('localStorage');
  });
});
