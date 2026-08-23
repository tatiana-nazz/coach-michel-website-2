import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getStateReconciliationHandoffViewModel } from '@/features/operations/screens/scr-ops-004/state-reconciliation-handoff.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-004/state-reconciliation-handoff.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-004/state-reconciliation-handoff.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  workspaceReference: 'WORKSPACE::neutral/OPS-004',
  validationReference: 'VALIDATION::neutral/OPS-004',
  handoffReferences: ['HANDOFF::neutral/OPS-004'],
  affectedSubjectReferences: ['SUBJECT::neutral/OPS-004'],
  affectedScheduleReferences: ['SCHEDULE::neutral/OPS-004'],
  evidenceReferences: [],
  auditReferences: [],
  derivedStatusReferences: [],
  reconciliationReferences: [],
  dependencyReferences: [],
  authorityStatusReference: 'AUTHORITY::neutral/OPS-004',
  lifecycleStatusReference: 'LIFECYCLE::neutral/OPS-004',
  handoffOptions: [],
} as const;
const visibility = {
  review_validation_context: true,
  submit_reconciliation_handoff: true,
  refresh_derived_status: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-004 English and Arabic direction equivalence', () => {
  it('keeps state, consequence, visibility, and exact references equivalent', () => {
    const english = getStateReconciliationHandoffViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getStateReconciliationHandoffViewModel(
      'ar',
      'authoritative_final',
      snapshot,
      visibility,
    );
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
