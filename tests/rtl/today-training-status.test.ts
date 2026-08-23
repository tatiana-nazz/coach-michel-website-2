import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getTodayTrainingStatusViewModel } from '@/features/trainee/screens/scr-trn-001/today-training-status.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-001/today-training-status.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-001/today-training-status.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  coachingDayContext: 'DAY::neutral/AR-001',
  statusReference: 'STATUS::neutral/AR-001',
  statusHeading: 'حالة',
  statusBody: 'وصف',
  nextActionHeading: 'التالي',
  nextActionBody: 'وصف',
} as const;
const visibility = {
  request_next_action: true,
  refresh_projection: false,
  retry: false,
  reconcile: false,
} as const;

describe('SCR-TRN-001 English and Arabic direction equivalence', () => {
  it('changes direction without changing state consequence', () => {
    const en = getTodayTrainingStatusViewModel('en', 'pending', snapshot, visibility);
    const ar = getTodayTrainingStatusViewModel('ar', 'pending', snapshot, visibility);
    expect(en.direction).toBe('ltr');
    expect(ar.direction).toBe('rtl');
    expect(ar.state).toBe(en.state);
    expect(ar.feedbackRole).toBe(en.feedbackRole);
    expect(ar.feedbackTone).toBe(en.feedbackTone);
  });
  it('preserves opaque coaching-day and status references exactly', () => {
    const model = getTodayTrainingStatusViewModel('ar', 'ready', snapshot, visibility);
    expect(model.opaqueReferences.coachingDayContext).toBe(snapshot.coachingDayContext);
    expect(model.opaqueReferences.statusReference).toBe(snapshot.statusReference);
  });
  it('uses shared direction and logical CSS without direction-specific ordering', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(styles).toContain('margin-inline:');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
