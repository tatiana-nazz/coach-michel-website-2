import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createTodayTrainingStatusIntent,
  getTodayTrainingStatusViewModel,
  isTodayTrainingStatusIntentEnabled,
  mapTodayTrainingStatusErrorCode,
  todayTrainingStatusStates,
} from '@/features/trainee/screens/scr-trn-001/today-training-status.model';

const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-001/today-training-status.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  coachingDayContext: 'DAY::opaque/001',
  sessionReference: 'SESSION::opaque/001',
  statusReference: 'STATUS::opaque/001',
  statusHeading: 'Caller status',
  statusBody: 'Caller body',
  nextActionReference: 'ACTION::opaque/001',
  nextActionHeading: 'Caller action',
  nextActionBody: 'Caller action body',
} as const;
const projection = {
  projectionKey: 'PROJECTION::opaque/001',
  sourceEvidenceReferences: ['EVIDENCE::opaque/001'],
  retryContext: 'RETRY::opaque/001',
} as const;
const visibility = {
  request_next_action: true,
  refresh_projection: true,
  retry: false,
  reconcile: false,
} as const;

describe('SCR-TRN-001 today training status model', () => {
  it('keeps governed states and mapped errors distinct', () => {
    expect(todayTrainingStatusStates).toContain('pending');
    expect(todayTrainingStatusStates).toContain('durable_final');
    expect(mapTodayTrainingStatusErrorCode('RESOURCE_NOT_FOUND')).toBe('resource_not_found');
    expect(mapTodayTrainingStatusErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapTodayTrainingStatusErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });

  it('preserves upstream coaching-day, session, status, projection, and evidence references', () => {
    const model = getTodayTrainingStatusViewModel('ar', 'ready', snapshot, visibility, projection);
    const intent = createTodayTrainingStatusIntent('refresh_projection', snapshot, projection);
    expect(model.direction).toBe('rtl');
    expect(model.opaqueReferences).toEqual({
      coachingDayContext: snapshot.coachingDayContext,
      sessionReference: snapshot.sessionReference,
      statusReference: snapshot.statusReference,
      nextActionReference: snapshot.nextActionReference,
      projectionKey: projection.projectionKey,
      sourceEvidenceReferences: projection.sourceEvidenceReferences,
    });
    expect(intent).toEqual({
      kind: 'refresh_projection',
      projectionKey: projection.projectionKey,
      sourceEvidenceReferences: projection.sourceEvidenceReferences,
    });
  });

  it('gates semantic intents by caller state without promoting them to durable success', () => {
    expect(
      isTodayTrainingStatusIntentEnabled('ready', 'request_next_action', snapshot, projection),
    ).toBe(true);
    expect(
      isTodayTrainingStatusIntentEnabled('pending', 'request_next_action', snapshot, projection),
    ).toBe(false);
    expect(getTodayTrainingStatusViewModel('en', 'ready', snapshot, visibility).durableFinal).toBe(
      false,
    );
    expect(
      getTodayTrainingStatusViewModel('en', 'durable_final', snapshot, visibility).durableFinal,
    ).toBe(true);
  });

  it('contains no device clock, actor assertion, transport, route, or storage behavior', () => {
    expect(source).not.toContain('Date.now');
    expect(source).not.toContain('new Date');
    expect(source).not.toContain('trainee_context');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('browserApiClient');
    expect(source).not.toContain('operationRegistry');
    expect(source).not.toContain('localStorage');
  });
});
