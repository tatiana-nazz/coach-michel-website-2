import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getTraineeContextViewModel } from '@/features/coach/screens/scr-coa-003/trainee-context.model';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/coach/screens/scr-coa-003/trainee-context.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-003/trainee-context.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  traineeReference: 'TRAINEE::neutral/AR-003',
  authorityStatusReference: 'AUTHORITY::neutral/AR-003',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-003',
  summaries: [],
  evidenceReferences: ['EVIDENCE::neutral/AR-003'],
} as const;

const visibility = {
  review_context_item: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-003 English and Arabic direction equivalence', () => {
  it('keeps trainee context and consequences equivalent while changing only direction', () => {
    const english = getTraineeContextViewModel('en', 'pending', snapshot, visibility);
    const arabic = getTraineeContextViewModel('ar', 'pending', snapshot, visibility);

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
    expect(arabic.consequence).toBe(english.consequence);
    expect(arabic.visibleIntents).toEqual(english.visibleIntents);
    expect(arabic.opaqueReferences).toEqual(english.opaqueReferences);
  });

  it('uses one source order, semantic direction, logical CSS, and neutral references', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(styles).toContain('margin-inline: auto;');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('margin-right:');
    expect(styles).not.toContain('padding-left:');
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
