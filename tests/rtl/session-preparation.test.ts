import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getSessionPreparationViewModel } from '@/features/coach/screens/scr-coa-005/session-preparation.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-005/session-preparation.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-005/session-preparation.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  traineeReference: 'TRAINEE::neutral/AR-005',
  sessionReference: 'SESSION::neutral/AR-005',
  authorityStatusReference: 'AUTHORITY::neutral/AR-005',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-005',
  sequence: [],
  exercises: [],
  guidance: [],
  evidenceReferences: ['EVIDENCE::neutral/AR-005'],
  auditReferences: ['AUDIT::neutral/AR-005'],
  draftIntentAvailable: false,
} as const;

const visibility = {
  review_exercise: true,
  prepare_session_draft_intent: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-005 English and Arabic direction equivalence', () => {
  it('keeps preparation state, consequence, visibility, and opaque references equivalent', () => {
    const english = getSessionPreparationViewModel('en', 'pending', snapshot, visibility);
    const arabic = getSessionPreparationViewModel('ar', 'pending', snapshot, visibility);

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
    expect(arabic.consequence).toBe(english.consequence);
    expect(arabic.visibleIntents).toEqual(english.visibleIntents);
    expect(arabic.opaqueReferences).toEqual(english.opaqueReferences);
  });

  it('uses semantic direction, neutral references, logical CSS, and retained breakpoints', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(styles).toContain('margin-inline: auto;');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).toContain('@media (min-width: 600px)');
    expect(styles).toContain('@media (min-width: 900px)');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('margin-right:');
    expect(styles).not.toContain('padding-left:');
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
