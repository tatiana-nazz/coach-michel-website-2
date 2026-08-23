import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createExerciseSequenceIntent,
  getExerciseSequenceViewModel,
  isExerciseSequenceIntentEnabled,
  mapExerciseSequenceErrorCode,
} from '@/features/trainee/screens/scr-trn-003/exercise-sequence.model';
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-003/exercise-sequence.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const itemA = {
  exerciseReference: 'EXERCISE::opaque/A',
  heading: 'A',
  summary: 'A summary',
  statusLabel: 'A status',
  availableForIntent: true,
} as const;
const itemB = {
  exerciseReference: 'EXERCISE::opaque/B',
  heading: 'B',
  summary: 'B summary',
  statusLabel: 'B status',
  availableForIntent: false,
} as const;
const snapshot = {
  sessionScheduleReference: 'SCHEDULE::opaque/003',
  currentExerciseReference: itemA.exerciseReference,
  progressLabel: 'Caller progress',
  progressValue: 1,
  progressMaximum: 2,
  items: [itemA, itemB],
} as const;
const visibility = { request_exercise: true, retry: false, reconcile: false } as const;
describe('SCR-TRN-003 exercise sequence model', () => {
  it('maps source-supported errors distinctly', () => {
    expect(mapExerciseSequenceErrorCode('AUTHENTICATION_REQUIRED_OR_INVALID')).toBe(
      'authentication_required',
    );
    expect(mapExerciseSequenceErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapExerciseSequenceErrorCode('DEPENDENCY_UNAVAILABLE')).toBe('dependency_unavailable');
    expect(mapExerciseSequenceErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });
  it('preserves caller order, progress, schedule, and exercise references', () => {
    const model = getExerciseSequenceViewModel('ar', 'ready', snapshot, visibility);
    const intent = createExerciseSequenceIntent('request_exercise', snapshot, itemA, undefined);
    expect(model.direction).toBe('rtl');
    expect(model.opaqueReferences.sessionScheduleReference).toBe(snapshot.sessionScheduleReference);
    expect(model.opaqueReferences.exerciseReferences).toEqual([
      itemA.exerciseReference,
      itemB.exerciseReference,
    ]);
    expect(intent).toEqual({
      kind: 'request_exercise',
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: itemA.exerciseReference,
    });
  });
  it('uses caller eligibility and never promotes a request to durable completion', () => {
    expect(isExerciseSequenceIntentEnabled('ready', 'request_exercise', itemA, undefined)).toBe(
      true,
    );
    expect(isExerciseSequenceIntentEnabled('ready', 'request_exercise', itemB, undefined)).toBe(
      false,
    );
    expect(isExerciseSequenceIntentEnabled('pending', 'request_exercise', itemA, undefined)).toBe(
      false,
    );
    expect(getExerciseSequenceViewModel('en', 'ready', snapshot, visibility).durableFinal).toBe(
      false,
    );
    expect(
      getExerciseSequenceViewModel('en', 'durable_final', snapshot, visibility).durableFinal,
    ).toBe(true);
  });
  it('does not sort, parse, persist, navigate, or transport', () => {
    expect(source).not.toContain('.sort(');
    expect(source).not.toContain('.split(');
    expect(source).not.toContain('trainee_context');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('browserApiClient');
    expect(source).not.toContain('operationRegistry');
    expect(source).not.toContain('localStorage');
  });
});
