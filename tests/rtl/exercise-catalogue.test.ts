import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getExerciseCatalogueViewModel } from '@/features/coach/screens/scr-coa-006/exercise-catalogue.model';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/coach/screens/scr-coa-006/exercise-catalogue.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-006/exercise-catalogue.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const exercise = {
  exerciseReference: 'EXERCISE::neutral/AR-006',
  orderingReference: 'ORDER::neutral/AR-006',
  evidenceReferences: ['EVIDENCE::neutral/AR-006'],
  displayLabel: 'تمرين يقدمه المستدعي',
  approvalStatusLabel: 'حالة موافقة يقدمها المستدعي',
  safetyStatusLabel: 'حالة سلامة يقدمها المستدعي',
  rightsStatusLabel: 'حالة حقوق يقدمها المستدعي',
  complexityStatusLabel: 'حالة تعقيد يقدمها المستدعي',
  languageStatusLabel: 'حالة لغة يقدمها المستدعي',
  accessibilityStatusLabel: 'حالة إتاحة يقدمها المستدعي',
  summary: 'ملخص يقدمه المستدعي',
  reviewAvailable: true,
  draftIntentAvailable: false,
  publicationContextAvailable: false,
} as const;

const snapshot = {
  catalogueReference: 'CATALOGUE::neutral/AR-006',
  authorityStatusReference: 'AUTHORITY::neutral/AR-006',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-006',
  exercises: [exercise],
  approvalFilterOptions: [],
  sortOptions: [],
} as const;

const visibility = {
  review_exercise: true,
  prepare_content_draft_intent: true,
  review_publication_context: true,
  refresh_catalogue: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-006 English and Arabic direction equivalence', () => {
  it('keeps catalogue state, consequence, order, visibility, and references equivalent', () => {
    const english = getExerciseCatalogueViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getExerciseCatalogueViewModel('ar', 'authoritative_final', snapshot, visibility);

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
