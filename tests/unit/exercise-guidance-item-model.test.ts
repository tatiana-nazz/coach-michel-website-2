import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createExerciseGuidanceItemIntent,
  getExerciseGuidanceItemViewModel,
  isExerciseGuidanceItemIntentEnabled,
  mapExerciseGuidanceItemErrorCode,
} from '@/features/trainee/screens/scr-trn-004/exercise-guidance-item.model';
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-004/exercise-guidance-item.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const instruction = {
  instructionReference: 'INSTRUCTION::opaque/004',
  heading: 'Caller instruction',
  body: 'Caller body',
} as const;
const media = {
  mediaReference: 'MEDIA::opaque/004',
  accessibleLabel: 'Caller label',
  caption: 'Caller caption',
  rightsEvidenceReference: 'RIGHTS::opaque/004',
} as const;
const snapshot = {
  sessionScheduleReference: 'SCHEDULE::opaque/004',
  exerciseReference: 'EXERCISE::opaque/004',
  exerciseHeading: 'Caller exercise',
  exerciseSummary: 'Caller summary',
  progressLabel: 'Caller progress',
  instructions: [instruction],
  media: [media],
  actionReference: 'ACTION::opaque/004',
} as const;
const external = {
  correlationReference: 'CORRELATION::opaque/004',
  minimumBusinessIntent: 'INTENT::opaque/004',
  purposeContext: 'PURPOSE::opaque/004',
  retryContext: 'RETRY::opaque/004',
} as const;
const visibility = {
  request_guidance_action: true,
  support_privacy: false,
  external_handoff: true,
  retry: false,
  reconcile: false,
} as const;
describe('SCR-TRN-004 exercise guidance item model', () => {
  it('keeps governed failure and lifecycle mappings distinct', () => {
    expect(mapExerciseGuidanceItemErrorCode('RESOURCE_NOT_FOUND')).toBe('resource_not_found');
    expect(mapExerciseGuidanceItemErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapExerciseGuidanceItemErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });
  it('preserves schedule, exercise, instruction, media, rights, and correlation references', () => {
    const model = getExerciseGuidanceItemViewModel('ar', 'ready', snapshot, visibility, external);
    const intent = createExerciseGuidanceItemIntent('external_handoff', snapshot, external);
    expect(model.direction).toBe('rtl');
    expect(model.opaqueReferences).toEqual({
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: snapshot.exerciseReference,
      instructionReferences: [instruction.instructionReference],
      mediaReferences: [media.mediaReference],
      rightsEvidenceReferences: [media.rightsEvidenceReference],
      actionReference: snapshot.actionReference,
      correlationReference: external.correlationReference,
    });
    expect(intent).toEqual({
      kind: 'external_handoff',
      sessionScheduleReference: snapshot.sessionScheduleReference,
      exerciseReference: snapshot.exerciseReference,
      ...external,
    });
  });
  it('uses explicit visibility/state context and caller-only durable final state', () => {
    expect(
      getExerciseGuidanceItemViewModel('en', 'ready', snapshot, visibility, external)
        .visibleIntents,
    ).toEqual(['request_guidance_action', 'external_handoff']);
    expect(
      isExerciseGuidanceItemIntentEnabled('ready', 'external_handoff', snapshot, external),
    ).toBe(true);
    expect(
      isExerciseGuidanceItemIntentEnabled('pending', 'external_handoff', snapshot, external),
    ).toBe(false);
    expect(getExerciseGuidanceItemViewModel('en', 'ready', snapshot, visibility).durableFinal).toBe(
      false,
    );
    expect(
      getExerciseGuidanceItemViewModel('en', 'durable_final', snapshot, visibility).durableFinal,
    ).toBe(true);
  });
  it('contains no media selection, actor assertion, route, transport, or storage behavior', () => {
    expect(source).not.toContain('trainee_context');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('browserApiClient');
    expect(source).not.toContain('operationRegistry');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('http://');
    expect(source).not.toContain('https://');
  });
});
