import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  completionSubmissionStates,
  createCompletionSubmissionIntent,
  getCompletionSubmissionViewModel,
  isCompletionSubmissionIntentEnabled,
  mapCompletionSubmissionErrorCode,
  validateCompletionSubmissionContext,
} from '@/features/trainee/screens/scr-trn-005/completion-submission.model';

const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-005/completion-submission.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const context = {
  scheduleReference: 'SCHEDULE::opaque/005',
  businessIntentReference: 'INTENT::opaque/005',
  clientEvidenceReferences: ['EVIDENCE::opaque/005'],
  retryCorrelationReference: 'RETRY::opaque/005',
} as const;
const visibility = {
  submit_completion_intent: true,
  retry: true,
  reconcile_existing_completion: true,
} as const;

describe('SCR-TRN-005 completion submission model', () => {
  it('keeps governed command, conflict, pending, recovery, and durable states distinct', () => {
    expect(completionSubmissionStates).toContain('pending');
    expect(completionSubmissionStates).toContain('durable_final');
    expect(mapCompletionSubmissionErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapCompletionSubmissionErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
    expect(mapCompletionSubmissionErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
  });

  it('enforces only required local shape checks', () => {
    expect(validateCompletionSubmissionContext(context)).toEqual([]);
    expect(
      validateCompletionSubmissionContext({
        scheduleReference: '',
        businessIntentReference: ' ',
        clientEvidenceReferences: [],
      }),
    ).toEqual([
      'schedule_reference_required',
      'business_intent_reference_required',
      'evidence_reference_required',
    ]);
  });

  it('preserves opaque schedule, intent, evidence, and retry references exactly', () => {
    const model = getCompletionSubmissionViewModel('ar', 'ready', context, visibility);
    const intent = createCompletionSubmissionIntent('submit_completion_intent', context);
    expect(model.direction).toBe('rtl');
    expect(model.opaqueReferences).toEqual({
      scheduleReference: context.scheduleReference,
      businessIntentReference: context.businessIntentReference,
      clientEvidenceReferences: context.clientEvidenceReferences,
      retryCorrelationReference: context.retryCorrelationReference,
    });
    expect(intent).toEqual({
      kind: 'submit_completion_intent',
      scheduleReference: context.scheduleReference,
      oneBusinessIntentReference: context.businessIntentReference,
      clientEvidenceReferences: context.clientEvidenceReferences,
    });
  });

  it('gates semantic intents without upgrading local acknowledgement to durable completion', () => {
    expect(isCompletionSubmissionIntentEnabled('ready', 'submit_completion_intent', context)).toBe(
      true,
    );
    expect(
      isCompletionSubmissionIntentEnabled('pending', 'submit_completion_intent', context),
    ).toBe(false);
    expect(
      getCompletionSubmissionViewModel('en', 'pending', context, visibility).durableFinal,
    ).toBe(false);
    expect(
      getCompletionSubmissionViewModel('en', 'durable_final', context, visibility).durableFinal,
    ).toBe(true);
    expect(
      createCompletionSubmissionIntent('reconcile_existing_completion', {
        ...context,
        clientEvidenceReferences: [],
      }),
    ).toBeUndefined();
  });

  it('contains no actor assertion, transport, route, upload, clock, or storage behavior', () => {
    expect(source).not.toContain('trainee_authority');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('browserApiClient');
    expect(source).not.toContain('operationRegistry');
    expect(source).not.toContain('FormData');
    expect(source).not.toContain('Date.now');
    expect(source).not.toContain('new Date');
    expect(source).not.toContain('localStorage');
  });
});
