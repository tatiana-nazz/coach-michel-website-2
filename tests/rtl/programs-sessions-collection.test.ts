import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getProgramsSessionsCollectionViewModel } from '@/features/coach/screens/scr-coa-004/programs-sessions-collection.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-004/programs-sessions-collection.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-004/programs-sessions-collection.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const program = {
  kind: 'program',
  programReference: 'PROGRAM::neutral/AR-004',
  orderingReference: 'ORDER::neutral/program-AR-004',
  traineeReference: 'TRAINEE::neutral/AR-004',
  displayLabel: 'برنامج يقدمه المستدعي',
  statusLabel: 'حالة يقدمها المستدعي',
  scheduleLabel: 'توقيت يقدمه المستدعي',
  summary: 'ملخص يقدمه المستدعي',
  reviewAvailable: true,
  draftIntentAvailable: true,
} as const;

const snapshot = {
  collectionReference: 'COLLECTION::neutral/AR-004',
  authorityStatusReference: 'AUTHORITY::neutral/AR-004',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-004',
  programs: [program],
  sessions: [],
  filterOptions: [],
  sortOptions: [],
} as const;

const visibility = {
  review_item: true,
  prepare_draft_intent: true,
  refresh_collection: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-004 English and Arabic direction equivalence', () => {
  it('keeps planning state, consequence, order, and opaque references equivalent', () => {
    const english = getProgramsSessionsCollectionViewModel('en', 'pending', snapshot, visibility);
    const arabic = getProgramsSessionsCollectionViewModel('ar', 'pending', snapshot, visibility);

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
