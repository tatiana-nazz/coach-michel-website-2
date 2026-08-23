import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  confirmationReconciliationStates,
  createConfirmationReconciliationIntent,
  getConfirmationReconciliationViewModel,
  isConfirmationReconciliationIntentEnabled,
  mapConfirmationReconciliationErrorCode,
} from '@/features/trainee/screens/scr-trn-006/confirmation-reconciliation-state.model';

const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-006/confirmation-reconciliation-state.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  scheduleCompletionOrCaseReference: 'CASE::opaque/006',
  boundedRoleContext: 'ROLE-CONTEXT::opaque/006',
  statusReference: 'STATUS::opaque/006',
  statusHeading: 'Caller status',
  statusBody: 'Caller status body',
  completionReference: 'COMPLETION::opaque/006',
  reconciliationReference: 'RECONCILIATION::opaque/006',
  evidenceReferences: ['EVIDENCE::opaque/006'],
} as const;
const projection = {
  projectionKey: 'PROJECTION::opaque/006',
  sourceEvidenceReferences: ['SOURCE-EVIDENCE::opaque/006'],
  retryContext: 'RETRY::opaque/006',
} as const;
const visibility = {
  refresh_projection: true,
  reconcile: true,
  retry: true,
} as const;

describe('SCR-TRN-006 confirmation and reconciliation model', () => {
  it('keeps pending, existing, uncertain, recovered, conflict, and durable states distinct', () => {
    for (const state of [
      'pending',
      'existing_completion',
      'uncertain',
      'recovered',
      'durable_confirmed',
    ])
      expect(confirmationReconciliationStates).toContain(state);
    expect(mapConfirmationReconciliationErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
    expect(mapConfirmationReconciliationErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapConfirmationReconciliationErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });

  it('preserves all caller-supplied opaque references exactly', () => {
    const model = getConfirmationReconciliationViewModel(
      'ar',
      'uncertain',
      snapshot,
      visibility,
      projection,
    );
    expect(model.direction).toBe('rtl');
    expect(model.opaqueReferences).toEqual({
      scheduleCompletionOrCaseReference: snapshot.scheduleCompletionOrCaseReference,
      boundedRoleContext: snapshot.boundedRoleContext,
      statusReference: snapshot.statusReference,
      completionReference: snapshot.completionReference,
      reconciliationReference: snapshot.reconciliationReference,
      evidenceReferences: snapshot.evidenceReferences,
      projectionKey: projection.projectionKey,
      sourceEvidenceReferences: projection.sourceEvidenceReferences,
    });
  });

  it('creates adapter-neutral refresh and reconciliation intents without parsing references', () => {
    expect(
      createConfirmationReconciliationIntent('refresh_projection', snapshot, projection),
    ).toEqual({
      kind: 'refresh_projection',
      projectionKey: projection.projectionKey,
      sourceEvidenceReferences: projection.sourceEvidenceReferences,
    });
    expect(createConfirmationReconciliationIntent('reconcile', snapshot, projection)).toEqual({
      kind: 'reconcile',
      scheduleCompletionOrCaseReference: snapshot.scheduleCompletionOrCaseReference,
      reconciliationReference: snapshot.reconciliationReference,
      evidenceReferences: [...snapshot.evidenceReferences, ...projection.sourceEvidenceReferences],
    });
    expect(
      isConfirmationReconciliationIntentEnabled('uncertain', 'reconcile', snapshot, projection),
    ).toBe(true);
    expect(
      createConfirmationReconciliationIntent(
        'reconcile',
        { ...snapshot, evidenceReferences: [] },
        undefined,
      ),
    ).toBeUndefined();
    expect(
      createConfirmationReconciliationIntent('refresh_projection', snapshot, {
        ...projection,
        sourceEvidenceReferences: [],
      }),
    ).toBeUndefined();
  });

  it('allows durable confirmation only from the caller-controlled authoritative state', () => {
    const pending = getConfirmationReconciliationViewModel('en', 'pending', snapshot, visibility);
    const existing = getConfirmationReconciliationViewModel(
      'en',
      'existing_completion',
      snapshot,
      visibility,
    );
    const durable = getConfirmationReconciliationViewModel(
      'en',
      'durable_confirmed',
      snapshot,
      visibility,
    );
    expect(pending.durableConfirmed).toBe(false);
    expect(existing.outcomeKind).toBe('existing_completion');
    expect(existing.durableConfirmed).toBe(false);
    expect(durable.durableConfirmed).toBe(true);
    expect(durable.outcomeKind).toBe('durable_confirmed');
  });

  it('contains no actor assertion, transport, route, identifier parser, clock, or storage behavior', () => {
    expect(source).not.toContain('trainee_authority');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('browserApiClient');
    expect(source).not.toContain('operationRegistry');
    expect(source).not.toContain('.split(');
    expect(source).not.toContain('URL(');
    expect(source).not.toContain('Date.now');
    expect(source).not.toContain('new Date');
    expect(source).not.toContain('localStorage');
  });
});
