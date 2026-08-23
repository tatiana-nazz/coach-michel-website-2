import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getTraineesCollectionViewModel } from '@/features/coach/screens/scr-coa-002/trainees-collection.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-002/trainees-collection.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-002/trainees-collection.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const trainee = {
  traineeReference: 'TRAINEE::neutral/AR-002',
  orderingReference: 'ORDER::neutral/AR-002',
  displayLabel: 'اسم يقدمه المستدعي',
  statusLabel: 'حالة يقدمها المستدعي',
  summary: 'ملخص يقدمه المستدعي',
  selectionAvailable: true,
} as const;

const snapshot = {
  collectionReference: 'COLLECTION::neutral/AR-002',
  authorityStatusReference: 'AUTHORITY::neutral/AR-002',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-002',
  trainees: [trainee],
  searchOptions: [],
  filterOptions: [],
  sortOptions: [],
} as const;

const visibility = {
  select_trainee: true,
  refresh_collection: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-002 English and Arabic direction equivalence', () => {
  it('keeps collection order and consequences equivalent while changing only direction', () => {
    const english = getTraineesCollectionViewModel('en', 'ready', snapshot, visibility);
    const arabic = getTraineesCollectionViewModel('ar', 'ready', snapshot, visibility);

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
    expect(arabic.visibleIntents).toEqual(english.visibleIntents);
    expect(arabic.opaqueReferences.traineeReferences).toEqual([trainee.traineeReference]);
    expect(arabic.opaqueReferences.orderingReferences).toEqual([trainee.orderingReference]);
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
