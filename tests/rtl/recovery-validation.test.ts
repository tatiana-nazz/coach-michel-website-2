import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getRecoveryValidationViewModel } from '@/features/operations/screens/scr-ops-003/recovery-validation.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-003/recovery-validation.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-003/recovery-validation.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  workspaceReference: 'WORKSPACE::neutral/OPS-003',
  recoveryActivityReference: 'ACTIVITY::neutral/OPS-003',
  validationReferences: ['VALIDATION::neutral/OPS-003'],
  objectives: [],
  evidenceReferences: [],
  auditReferences: [],
  dependencyReferences: [],
  validatorStatusReference: 'VALIDATOR::neutral/OPS-003',
  authorityStatusReference: 'AUTHORITY::neutral/OPS-003',
  lifecycleStatusReference: 'LIFECYCLE::neutral/OPS-003',
  decisions: [],
} as const;
const visibility = {
  review_recovery_activity_context: true,
  review_objective: true,
  submit_validation: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-003 English and Arabic direction equivalence', () => {
  it('keeps state, consequence, visibility, and exact references equivalent', () => {
    const english = getRecoveryValidationViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getRecoveryValidationViewModel(
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
