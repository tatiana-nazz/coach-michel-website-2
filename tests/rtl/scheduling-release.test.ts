import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getSchedulingReleaseViewModel } from '@/features/coach/screens/scr-coa-007/scheduling-release.model';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/coach/screens/scr-coa-007/scheduling-release.tsx', import.meta.url),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-007/scheduling-release.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  workspaceReference: 'WORKSPACE::neutral/AR-007',
  subjectScopeReference: 'SUBJECT::neutral/AR-007',
  definitionVersionReferences: ['VERSION::neutral/AR-007'],
  scheduleReleaseIntentReference: 'INTENT::neutral/AR-007',
  authoritativeCoachingTimeContext: 'TIME::neutral/AR-007',
  effectiveTimeContext: 'EFFECTIVE::neutral/AR-007',
  reason: { categoryLabel: 'فئة يقدمها المستدعي', rationale: 'سبب يقدمه المستدعي' },
  evidenceReferences: ['EVIDENCE::neutral/AR-007'],
  authorityStatusReference: 'AUTHORITY::neutral/AR-007',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-007',
} as const;
const visibility = {
  review_preview: true,
  submit_release_intent: true,
  review_policy_context: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-007 English and Arabic direction equivalence', () => {
  it('keeps state, consequence, visibility, and exact references equivalent', () => {
    const english = getSchedulingReleaseViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getSchedulingReleaseViewModel('ar', 'authoritative_final', snapshot, visibility);
    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
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
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
