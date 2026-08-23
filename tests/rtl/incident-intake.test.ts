import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getIncidentIntakeViewModel } from '@/features/operations/screens/scr-ops-001/incident-intake.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-001/incident-intake.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-001/incident-intake.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  workspaceReference: 'WORKSPACE::neutral/OPS-001',
  incidentReferences: ['INCIDENT::neutral/OPS-001'],
  affectedReferences: ['AFFECTED::neutral/OPS-001'],
  supportCaseReferences: [],
  privacyContextReferences: [],
  evidenceReferences: ['EVIDENCE::neutral/OPS-001'],
  auditReferences: [],
  dependencyReferences: [],
  authorityStatusReference: 'AUTHORITY::neutral/OPS-001',
  lifecycleStatusReference: 'LIFECYCLE::neutral/OPS-001',
  categories: [],
} as const;
const visibility = {
  review_incident_context: true,
  review_support_privacy_context: true,
  submit_incident_classification: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-001 English and Arabic direction equivalence', () => {
  it('keeps state, consequence, visibility, and exact references equivalent', () => {
    const english = getIncidentIntakeViewModel('en', 'authoritative_final', snapshot, visibility);
    const arabic = getIncidentIntakeViewModel('ar', 'authoritative_final', snapshot, visibility);
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
