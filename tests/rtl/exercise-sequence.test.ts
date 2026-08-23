import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getExerciseSequenceViewModel } from '@/features/trainee/screens/scr-trn-003/exercise-sequence.model';
const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-003/exercise-sequence.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-003/exercise-sequence.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const item = {
  exerciseReference: 'EXERCISE::neutral/AR-003',
  heading: 'تمرين',
  summary: 'وصف',
  statusLabel: 'حالة',
  availableForIntent: true,
} as const;
const snapshot = {
  sessionScheduleReference: 'SCHEDULE::neutral/AR-003',
  currentExerciseReference: item.exerciseReference,
  progressLabel: 'تقدم',
  progressValue: 1,
  progressMaximum: 1,
  items: [item],
} as const;
const visibility = { request_exercise: true, retry: false, reconcile: false } as const;
describe('SCR-TRN-003 English and Arabic direction equivalence', () => {
  it('changes direction without changing sequence consequences', () => {
    const en = getExerciseSequenceViewModel('en', 'pending', snapshot, visibility);
    const ar = getExerciseSequenceViewModel('ar', 'pending', snapshot, visibility);
    expect(en.direction).toBe('ltr');
    expect(ar.direction).toBe('rtl');
    expect(ar.state).toBe(en.state);
    expect(ar.feedbackRole).toBe(en.feedbackRole);
  });
  it('preserves schedule, current exercise, and caller order exactly', () => {
    const model = getExerciseSequenceViewModel('ar', 'ready', snapshot, visibility);
    expect(model.opaqueReferences.sessionScheduleReference).toBe(snapshot.sessionScheduleReference);
    expect(model.opaqueReferences.currentExerciseReference).toBe(item.exerciseReference);
    expect(model.opaqueReferences.exerciseReferences).toEqual([item.exerciseReference]);
  });
  it('uses semantic direction, neutral references, and logical CSS', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(styles).toContain('padding-inline-start:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('direction:');
  });
});
