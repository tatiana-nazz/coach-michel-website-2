import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createProvisioningInvitationIntent,
  getProvisioningInvitationEntryViewModel,
  isProvisioningIntentEnabled,
  mapProvisioningInvitationErrorCode,
  provisioningInvitationEntryStates,
  type ProvisioningInvitationEntryValues,
} from '@/features/access/screens/scr-acc-002/provisioning-invitation-entry.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-002/provisioning-invitation-entry.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const values: ProvisioningInvitationEntryValues = {
  candidateReference: 'CANDIDATE::opaque/002',
  invitationProvisioningEvidence: 'INVITATION::opaque/002',
  subjectAccountGrantReference: 'GRANT::opaque/002',
  capabilityScopeDurationIntent: 'SCOPE::opaque/002',
  reason: 'REASON::bounded/002',
  approvalExceptionEvidence: 'APPROVAL::opaque/002',
};

describe('SCR-ACC-002 provisioning or invitation entry model', () => {
  it('keeps governed access-lifecycle states distinct', () => {
    expect(provisioningInvitationEntryStates).toEqual([
      'loading',
      'ready',
      'empty',
      'validation_error',
      'authentication_required',
      'authority_denied',
      'resource_not_found_or_unavailable',
      'dependency_unavailable',
      'rate_limited',
      'stale_or_conflicting_state',
      'duplicate_or_already_applied',
      'lifecycle_conflict',
      'pending',
      'recovery',
      'durable_final',
    ]);
    expect(mapProvisioningInvitationErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapProvisioningInvitationErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapProvisioningInvitationErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });

  it('preserves caller-fed opaque evidence exactly in the view model and intent', () => {
    const viewModel = getProvisioningInvitationEntryViewModel('ar', 'ready', values);
    const intent = createProvisioningInvitationIntent('approve', values);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.candidateReference).toBe(values.candidateReference);
    expect(viewModel.opaqueReferences.invitationProvisioningEvidence).toBe(
      values.invitationProvisioningEvidence,
    );
    expect(intent).toEqual({ kind: 'approve', ...values });
  });

  it('does not enable authority-changing intent from pending or final presentation state', () => {
    expect(isProvisioningIntentEnabled('ready', 'provision')).toBe(true);
    expect(isProvisioningIntentEnabled('pending', 'approve')).toBe(false);
    expect(isProvisioningIntentEnabled('durable_final', 'provision')).toBe(false);
    expect(isProvisioningIntentEnabled('dependency_unavailable', 'retry')).toBe(true);
    expect(isProvisioningIntentEnabled('authority_denied', 'retry')).toBe(false);
  });

  it('contains no administrator-role assertion, transport, route, clock, or local durable storage', () => {
    expect(modelSource).not.toContain('administratorApproverRole');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('operationRegistry');
    expect(modelSource).not.toContain('Date.now');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('href');
  });
});
