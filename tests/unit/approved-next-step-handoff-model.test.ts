import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  approvedNextStepHandoffStates,
  createApprovedNextStepHandoffIntent,
  getApprovedNextStepHandoffViewModel,
  isApprovedNextStepHandoffIntentEnabled,
  mapApprovedNextStepHandoffErrorCode,
} from '@/features/public/screens/scr-pub-005/approved-next-step-handoff.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-005/approved-next-step-handoff.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const option = {
  optionReference: 'OPTION::opaque/PUB-005',
  category: 'CATEGORY::caller-supplied',
  value: 'VALUE::caller-supplied',
  heading: 'Caller-supplied heading',
  description: 'Caller-supplied description',
} as const;

const externalContext = {
  correlationReference: 'CORRELATION::opaque/PUB-005',
  minimumBusinessIntent: 'INTENT::bounded/PUB-005',
  purposeContext: 'PURPOSE::opaque/PUB-005',
  retryContext: 'RETRY::opaque/PUB-005',
} as const;

const supportPrivacyContext = {
  caseReference: 'CASE::opaque/PUB-005',
  routeStatusEscalationIntent: 'STATUS::caller-supplied',
  minimumEvidenceReferences: ['EVIDENCE::opaque/1', 'EVIDENCE::opaque/2'],
  reason: 'REASON::caller-supplied',
} as const;

const visibility = {
  request_next_step: true,
  support_privacy: false,
  external_handoff: true,
  retry: false,
  reconcile: false,
} as const;

describe('SCR-PUB-005 approved next-step handoff model', () => {
  it('keeps pending, recovery, mapped failures, and durable final state distinct', () => {
    expect(approvedNextStepHandoffStates).toContain('validation_error');
    expect(approvedNextStepHandoffStates).toContain('pending');
    expect(approvedNextStepHandoffStates).toContain('recovery');
    expect(approvedNextStepHandoffStates).toContain('durable_final');
    expect(mapApprovedNextStepHandoffErrorCode('RESOURCE_NOT_FOUND')).toBe('resource_not_found');
    expect(mapApprovedNextStepHandoffErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapApprovedNextStepHandoffErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapApprovedNextStepHandoffErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });

  it('preserves caller-fed option and opaque handoff context without interpretation', () => {
    const viewModel = getApprovedNextStepHandoffViewModel(
      'ar',
      'ready',
      [option],
      option.optionReference,
      visibility,
      externalContext,
      supportPrivacyContext,
    );
    const intent = createApprovedNextStepHandoffIntent(
      'external_handoff',
      option,
      externalContext,
      supportPrivacyContext,
    );

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences).toEqual({
      selectedOptionReference: option.optionReference,
      optionReferences: [option.optionReference],
      correlationReference: externalContext.correlationReference,
      caseReference: supportPrivacyContext.caseReference,
      minimumEvidenceReferences: supportPrivacyContext.minimumEvidenceReferences,
    });
    expect(intent).toEqual({
      kind: 'external_handoff',
      option: {
        optionReference: option.optionReference,
        category: option.category,
        value: option.value,
      },
      ...externalContext,
    });
  });

  it('uses only explicit caller-fed role/capability visibility and state-supported intents', () => {
    const viewModel = getApprovedNextStepHandoffViewModel(
      'en',
      'ready',
      [option],
      option.optionReference,
      visibility,
      externalContext,
      supportPrivacyContext,
    );

    expect(viewModel.visibleIntents).toEqual(['request_next_step', 'external_handoff']);
    expect(
      isApprovedNextStepHandoffIntentEnabled(
        'ready',
        'request_next_step',
        option,
        undefined,
        undefined,
      ),
    ).toBe(true);
    expect(
      isApprovedNextStepHandoffIntentEnabled(
        'pending',
        'request_next_step',
        option,
        externalContext,
        supportPrivacyContext,
      ),
    ).toBe(false);
    expect(
      isApprovedNextStepHandoffIntentEnabled(
        'authority_denied',
        'retry',
        option,
        externalContext,
        supportPrivacyContext,
      ),
    ).toBe(false);
    expect(
      isApprovedNextStepHandoffIntentEnabled(
        'rate_limited',
        'retry',
        option,
        externalContext,
        supportPrivacyContext,
      ),
    ).toBe(true);
  });

  it('does not infer transport, navigation, external selection, server actor scope, or durable success', () => {
    const readyViewModel = getApprovedNextStepHandoffViewModel(
      'en',
      'ready',
      [option],
      option.optionReference,
      visibility,
      externalContext,
      supportPrivacyContext,
    );
    const durableFinalViewModel = getApprovedNextStepHandoffViewModel(
      'en',
      'durable_final',
      [option],
      option.optionReference,
      visibility,
      externalContext,
      supportPrivacyContext,
    );
    const localIntent = createApprovedNextStepHandoffIntent(
      'request_next_step',
      option,
      externalContext,
      supportPrivacyContext,
    );

    expect(readyViewModel.durableFinal).toBe(false);
    expect(durableFinalViewModel.durableFinal).toBe(true);
    expect(localIntent).not.toHaveProperty('durableFinal');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('operationRegistry');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('href');
    expect(modelSource).not.toContain('actor_handler_scope');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('Date.now');
  });
});
