import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createExternalSupportHandoffIntent,
  externalSupportHandoffErrorCodes,
  externalSupportHandoffStates,
  getExternalSupportHandoffViewModel,
  isExternalSupportHandoffIntentEnabled,
  mapExternalSupportHandoffErrorCode,
} from '@/features/trainee/screens/scr-trn-008/external-support-handoff.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-008/external-support-handoff.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  boundedPrincipalContextReference: 'PRINCIPAL-CONTEXT::bounded/TRN-008',
  requestCategoryOptions: [
    {
      categoryReference: 'CATEGORY::allowlisted/TRN-008',
      label: 'Caller-supplied category',
      description: 'Caller-supplied category description',
    },
  ],
  selectedRequestCategoryReference: 'CATEGORY::allowlisted/TRN-008',
  minimumRoutingFacts: [
    {
      factReference: 'FACT::opaque/TRN-008',
      label: 'Caller-supplied fact label',
      value: 'FACT-VALUE::neutral/TRN-008',
    },
  ],
  consentPurposeContext: 'CONSENT-PURPOSE::bounded/TRN-008',
  caseReference: 'CASE::opaque/TRN-008',
  routeStatusOptions: [
    { optionReference: 'STATUS::allowlisted/TRN-008', label: 'Caller-supplied status' },
  ],
  selectedRouteStatusReference: 'STATUS::allowlisted/TRN-008',
  structuredReasonOptions: [
    { optionReference: 'REASON::allowlisted/TRN-008', label: 'Caller-supplied reason' },
  ],
  selectedStructuredReasonReference: 'REASON::allowlisted/TRN-008',
  minimumEvidenceReferences: ['EVIDENCE::integrity/TRN-008'],
  handoffContext: {
    correlationReference: 'CORRELATION::opaque/TRN-008',
    minimumBusinessIntentReference: 'BUSINESS-INTENT::bounded/TRN-008',
    purposeContext: 'PURPOSE::bounded/TRN-008',
    retryContext: 'RETRY::opaque/TRN-008',
  },
} as const;

const visibility = {
  initiate_support_privacy: true,
  route_or_escalate: true,
  external_handoff: true,
  retry: false,
  reconcile: true,
} as const;

describe('SCR-TRN-008 external support handoff model', () => {
  it('keeps lifecycle outcomes and exact mapped error vocabulary distinct', () => {
    expect(externalSupportHandoffStates).toContain('local_acknowledgement');
    expect(externalSupportHandoffStates).toContain('routed_or_escalated');
    expect(externalSupportHandoffStates).toContain('external_handoff');
    expect(externalSupportHandoffStates).toContain('durable_final');
    expect(externalSupportHandoffErrorCodes).toEqual([
      'AUTHENTICATION_REQUIRED_OR_INVALID',
      'AUTHORITY_DENIED',
      'DEPENDENCY_UNAVAILABLE',
      'DUPLICATE_OR_ALREADY_APPLIED',
      'LIFECYCLE_CONFLICT',
      'RATE_LIMITED',
      'RESOURCE_NOT_FOUND',
      'VALIDATION_FAILED',
    ]);
    expect(mapExternalSupportHandoffErrorCode('VALIDATION_FAILED')).toBe('validation_error');
    expect(mapExternalSupportHandoffErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });

  it('builds bounded initiation and governed routing intents from allowlisted selections', () => {
    expect(createExternalSupportHandoffIntent('initiate_support_privacy', snapshot)).toEqual({
      kind: 'initiate_support_privacy',
      boundedPrincipalContextReference: snapshot.boundedPrincipalContextReference,
      requestCategoryReference: snapshot.selectedRequestCategoryReference,
      minimumRoutingFactReferences: [snapshot.minimumRoutingFacts[0].factReference],
      consentPurposeContext: snapshot.consentPurposeContext,
    });
    expect(createExternalSupportHandoffIntent('route_or_escalate', snapshot)).toEqual({
      kind: 'route_or_escalate',
      caseReference: snapshot.caseReference,
      routeStatusReference: snapshot.selectedRouteStatusReference,
      minimumEvidenceReferences: snapshot.minimumEvidenceReferences,
      structuredReasonReference: snapshot.selectedStructuredReasonReference,
    });
  });

  it('preserves the minimum external context and gates semantic actions by state', () => {
    const intent = createExternalSupportHandoffIntent('external_handoff', snapshot);
    const viewModel = getExternalSupportHandoffViewModel(
      'ar',
      'routed_or_escalated',
      snapshot,
      visibility,
    );

    expect(intent).toEqual({ kind: 'external_handoff', ...snapshot.handoffContext });
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.consequence).toBe('routed');
    expect(viewModel.durableFinal).toBe(false);
    expect(viewModel.visibleIntents).toEqual([
      'initiate_support_privacy',
      'route_or_escalate',
      'external_handoff',
      'reconcile',
    ]);
    expect(
      isExternalSupportHandoffIntentEnabled('ready', 'initiate_support_privacy', snapshot),
    ).toBe(true);
    expect(
      isExternalSupportHandoffIntentEnabled('routed_or_escalated', 'external_handoff', snapshot),
    ).toBe(true);
    expect(isExternalSupportHandoffIntentEnabled('pending', 'external_handoff', snapshot)).toBe(
      false,
    );
  });

  it('does not infer messaging, uploads, transport details, server scope, or durable success', () => {
    expect(
      getExternalSupportHandoffViewModel('en', 'durable_final', snapshot, visibility).durableFinal,
    ).toBe(true);
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('actor_handler_scope');
    expect(modelSource).not.toContain('providerReference');
    expect(modelSource).not.toContain('channelReference');
    expect(modelSource).not.toContain('protocolReference');
    expect(modelSource).not.toContain('callbackReference');
    expect(modelSource).not.toContain('credentialReference');
    expect(modelSource).not.toContain('messageBody');
    expect(modelSource).not.toContain('upload');
  });
});
