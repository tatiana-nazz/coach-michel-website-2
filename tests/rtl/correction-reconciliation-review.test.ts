import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getCorrectionReconciliationReviewViewModel } from '@/features/coach/screens/scr-coa-009/correction-reconciliation-review.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-009/correction-reconciliation-review.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-009/correction-reconciliation-review.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const item = {
  orderingReference: 'ORDER::neutral/AR-009',
  caseReference: 'CASE::neutral/AR-009',
  affectedSubjectReferences: ['SUBJECT::neutral/AR-009'],
  scheduleReferences: ['SCHEDULE::neutral/AR-009'],
  evidenceReferences: ['EVIDENCE::neutral/AR-009'],
  reasonCategoryLabel: 'فئة يقدمها المستدعي',
  separationExceptionEvidenceReferences: [],
  incidentRecoveryReferences: [],
  auditReferences: ['AUDIT::neutral/AR-009'],
  displayLabel: 'حالة يقدمها المستدعي',
  statusLabel: 'حالة يقدمها المستدعي',
  proposalStatusLabel: 'حالة مقترح يقدمها المستدعي',
  decisionStatusLabel: 'حالة قرار يقدمها المستدعي',
  summary: 'ملخص يقدمه المستدعي',
  reviewAvailable: true,
  proposalIntentAvailable: true,
  decisionIntentAvailable: false,
  auditReviewAvailable: true,
} as const;
const snapshot = {
  reviewReference: 'REVIEW::neutral/AR-009',
  authorityStatusReference: 'AUTHORITY::neutral/AR-009',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-009',
  cases: [item],
} as const;
const visibility = {
  review_case: true,
  prepare_proposal_intent: true,
  prepare_decision_intent: true,
  review_audit_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-009 English and Arabic direction equivalence', () => {
  it('keeps state, order, consequence, visibility, and exact references equivalent', () => {
    const english = getCorrectionReconciliationReviewViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getCorrectionReconciliationReviewViewModel(
      'ar',
      'authoritative_final',
      snapshot,
      visibility,
    );
    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
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
