import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createFirstLoginNoticeIntent,
  firstLoginNoticesAcceptanceStates,
  getFirstLoginNoticesAcceptanceViewModel,
  mapFirstLoginNoticesErrorCode,
} from '@/features/access/screens/scr-acc-003/first-login-notices-acceptance.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-003/first-login-notices-acceptance.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const references = {
  principalReference: 'PRINCIPAL::opaque/003',
  disclosureVersionReference: 'VERSION::opaque/003',
  evidenceContext: 'EVIDENCE::opaque/003',
} as const;

describe('SCR-ACC-003 first-login notices and acceptance model', () => {
  it('keeps intent, pending, governed failures, and durable outcomes distinct', () => {
    expect(firstLoginNoticesAcceptanceStates).toContain('ready');
    expect(firstLoginNoticesAcceptanceStates).toContain('pending');
    expect(firstLoginNoticesAcceptanceStates).toContain('accepted_durable');
    expect(firstLoginNoticesAcceptanceStates).toContain('declined_durable');
    expect(mapFirstLoginNoticesErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
    expect(mapFirstLoginNoticesErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
  });

  it('enables response intent only for caller-declared ready state', () => {
    expect(getFirstLoginNoticesAcceptanceViewModel('en', 'ready', references).actionsEnabled).toBe(
      true,
    );
    expect(
      getFirstLoginNoticesAcceptanceViewModel('en', 'pending', references).actionsEnabled,
    ).toBe(false);
    expect(
      getFirstLoginNoticesAcceptanceViewModel('en', 'accepted_durable', references).durableOutcome,
    ).toBe('accepted');
    expect(
      getFirstLoginNoticesAcceptanceViewModel('en', 'declined_durable', references).durableOutcome,
    ).toBe('declined');
  });

  it('carries the exact opaque current-version and evidence references in intent', () => {
    const intent = createFirstLoginNoticeIntent('decline', references);
    const viewModel = getFirstLoginNoticesAcceptanceViewModel('ar', 'ready', references);

    expect(intent).toEqual({ response: 'decline', ...references });
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.disclosureVersionReference).toBe(
      references.disclosureVersionReference,
    );
  });

  it('contains no device-time authority, transport, route, or local acceptance storage', () => {
    expect(modelSource).not.toContain('Date.now');
    expect(modelSource).not.toContain('new Date');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('operationRegistry');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('href');
  });
});
