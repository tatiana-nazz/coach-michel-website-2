import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getExerciseGuidanceItemViewModel } from '@/features/trainee/screens/scr-trn-004/exercise-guidance-item.model';
const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-004/exercise-guidance-item.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-004/exercise-guidance-item.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const instruction = {
  instructionReference: 'INSTRUCTION::neutral/AR-004',
  heading: 'تعليمات',
  body: 'وصف',
} as const;
const media = {
  mediaReference: 'MEDIA::neutral/AR-004',
  accessibleLabel: 'وسائط',
  caption: 'وصف',
  rightsEvidenceReference: 'RIGHTS::neutral/AR-004',
} as const;
const snapshot = {
  sessionScheduleReference: 'SCHEDULE::neutral/AR-004',
  exerciseReference: 'EXERCISE::neutral/AR-004',
  exerciseHeading: 'تمرين',
  exerciseSummary: 'ملخص',
  progressLabel: 'تقدم',
  instructions: [instruction],
  media: [media],
} as const;
const visibility = {
  request_guidance_action: false,
  support_privacy: false,
  external_handoff: false,
  retry: false,
  reconcile: false,
} as const;
describe('SCR-TRN-004 English and Arabic direction equivalence', () => {
  it('changes direction without changing guidance consequence', () => {
    const en = getExerciseGuidanceItemViewModel('en', 'pending', snapshot, visibility);
    const ar = getExerciseGuidanceItemViewModel('ar', 'pending', snapshot, visibility);
    expect(en.direction).toBe('ltr');
    expect(ar.direction).toBe('rtl');
    expect(ar.state).toBe(en.state);
    expect(ar.feedbackRole).toBe(en.feedbackRole);
  });
  it('preserves every opaque guidance and rights reference in Arabic', () => {
    const model = getExerciseGuidanceItemViewModel('ar', 'ready', snapshot, visibility);
    expect(model.opaqueReferences.sessionScheduleReference).toBe(snapshot.sessionScheduleReference);
    expect(model.opaqueReferences.exerciseReference).toBe(snapshot.exerciseReference);
    expect(model.opaqueReferences.instructionReferences).toEqual([
      instruction.instructionReference,
    ]);
    expect(model.opaqueReferences.mediaReferences).toEqual([media.mediaReference]);
    expect(model.opaqueReferences.rightsEvidenceReferences).toEqual([
      media.rightsEvidenceReference,
    ]);
  });
  it('uses semantic direction, neutral references, and logical CSS', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('direction:');
  });
});
