import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getCoachOverviewViewModel } from '@/features/coach/screens/scr-coa-001/coach-overview.model';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/coach/screens/scr-coa-001/coach-overview.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-001/coach-overview.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  overviewStatusReference: 'OVERVIEW::neutral/AR-001',
  authorityStatusReference: 'AUTHORITY::neutral/AR-001',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-001',
  summaries: [],
  filterOptions: [],
  selectedFilterReferences: [],
} as const;

const visibility = {
  review_summary: true,
  refresh_overview: true,
  request_projection_reconciliation: true,
  retry: true,
} as const;

describe('SCR-COA-001 English and Arabic direction equivalence', () => {
  it('keeps overview status and consequences equivalent while changing only direction', () => {
    const english = getCoachOverviewViewModel('en', 'pending', snapshot, visibility);
    const arabic = getCoachOverviewViewModel('ar', 'pending', snapshot, visibility);

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
