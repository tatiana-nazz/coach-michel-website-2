import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getProvisioningInvitationEntryViewModel } from '@/features/access/screens/scr-acc-002/provisioning-invitation-entry.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-002/provisioning-invitation-entry.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-002/provisioning-invitation-entry.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const values = {
  candidateReference: 'CANDIDATE::neutral/AR-002',
  invitationProvisioningEvidence: 'INVITATION::neutral/AR-002',
  subjectAccountGrantReference: 'GRANT::neutral/AR-002',
  capabilityScopeDurationIntent: 'SCOPE::neutral/AR-002',
  reason: 'REASON::neutral/AR-002',
  approvalExceptionEvidence: 'APPROVAL::neutral/AR-002',
} as const;

describe('SCR-ACC-002 English and Arabic direction equivalence', () => {
  it('keeps equivalent state consequences while changing only direction', () => {
    const english = getProvisioningInvitationEntryViewModel('en', 'pending', values);
    const arabic = getProvisioningInvitationEntryViewModel('ar', 'pending', values);

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
  });

  it('preserves opaque references exactly in Arabic presentation', () => {
    const viewModel = getProvisioningInvitationEntryViewModel('ar', 'ready', values);

    expect(viewModel.opaqueReferences).toEqual({
      candidateReference: values.candidateReference,
      invitationProvisioningEvidence: values.invitationProvisioningEvidence,
      subjectAccountGrantReference: values.subjectAccountGrantReference,
      approvalExceptionEvidence: values.approvalExceptionEvidence,
    });
  });

  it('uses one source order, semantic direction, and logical CSS properties', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain("dir={isOpaqueField(field) ? 'ltr' : undefined}");
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
