import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getRecoveryOperationViewModel } from '@/features/operations/screens/scr-ops-002/recovery-operation.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-002/recovery-operation.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-002/recovery-operation.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  workspaceReference: 'WORKSPACE::neutral/OPS-002',
  incidentReference: 'INCIDENT::neutral/OPS-002',
  recoveryActivityReferences: ['ACTIVITY::neutral/OPS-002'],
  governedCommandReferences: ['COMMAND::neutral/OPS-002'],
  evidenceReferences: [],
  auditReferences: [],
  dependencyReferences: [],
  externalHandoffCorrelationReferences: [],
  authorityStatusReference: 'AUTHORITY::neutral/OPS-002',
  lifecycleStatusReference: 'LIFECYCLE::neutral/OPS-002',
  activityOptions: [],
} as const;
const visibility = {
  review_incident_recovery_context: true,
  review_governed_command_context: true,
  submit_recovery_activity: true,
  external_handoff: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-002 English and Arabic direction equivalence', () => {
  it('keeps state, consequence, visibility, and exact references equivalent', () => {
    const english = getRecoveryOperationViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getRecoveryOperationViewModel('ar', 'authoritative_final', snapshot, visibility);
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
