import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  accessRecoveryStates,
  createAccessRecoveryIntent,
  getAccessRecoveryViewModel,
  isAccessRecoveryIntentEnabled,
  mapAccessRecoveryErrorCode,
} from '@/features/access/screens/scr-acc-004/access-recovery.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-004/access-recovery.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const values = {
  minimumRecoveryLocatorEvidence: 'LOCATOR::opaque/004',
  requestedRecoveryPurpose: 'PURPOSE::bounded/004',
} as const;

const authorityContext = {
  antiAbuseContext: 'ANTI-ABUSE::opaque/004',
  principalAdminAuthorityContext: 'AUTHORITY::opaque/004',
} as const;

const references = {
  recoveryReference: 'RECOVERY::opaque/004',
  externalHandoffCorrelationReference: 'HANDOFF::opaque/004',
} as const;

describe('SCR-ACC-004 access recovery model', () => {
  it('keeps initiation, pending, recovery, governed failures, and durable final state distinct', () => {
    expect(accessRecoveryStates).toContain('ready');
    expect(accessRecoveryStates).toContain('pending');
    expect(accessRecoveryStates).toContain('recovery');
    expect(accessRecoveryStates).toContain('durable_final');
    expect(mapAccessRecoveryErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapAccessRecoveryErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapAccessRecoveryErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });

  it('preserves caller-fed locator, anti-abuse, authority, recovery, and handoff references', () => {
    const viewModel = getAccessRecoveryViewModel(
      'ar',
      'recovery',
      values,
      authorityContext,
      references,
    );
    const intent = createAccessRecoveryIntent('external_handoff', values, references);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences).toEqual({
      minimumRecoveryLocatorEvidence: values.minimumRecoveryLocatorEvidence,
      antiAbuseContext: authorityContext.antiAbuseContext,
      principalAdminAuthorityContext: authorityContext.principalAdminAuthorityContext,
      recoveryReference: references.recoveryReference,
      externalHandoffCorrelationReference: references.externalHandoffCorrelationReference,
    });
    expect(intent).toEqual({
      kind: 'external_handoff',
      ...values,
      ...references,
    });
    expect(intent).not.toHaveProperty('antiAbuseContext');
    expect(intent).not.toHaveProperty('principalAdminAuthorityContext');
  });

  it('permits only state-supported initiation, retry, and handoff intent', () => {
    expect(isAccessRecoveryIntentEnabled('ready', 'initiate')).toBe(true);
    expect(isAccessRecoveryIntentEnabled('pending', 'initiate')).toBe(false);
    expect(isAccessRecoveryIntentEnabled('dependency_unavailable', 'retry')).toBe(true);
    expect(isAccessRecoveryIntentEnabled('authority_denied', 'retry')).toBe(false);
    expect(isAccessRecoveryIntentEnabled('recovery', 'external_handoff')).toBe(true);
    expect(isAccessRecoveryIntentEnabled('ready', 'external_handoff')).toBe(false);
  });

  it('contains no provider, channel, protocol, transport, route, credential, or local authority', () => {
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('operationRegistry');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('Date.now');
    expect(modelSource).not.toContain('href');
    expect(modelSource).not.toContain('credential');
  });
});
