import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createStateReconciliationHandoffIntent,
  getStateReconciliationHandoffViewModel,
  isStateReconciliationHandoffIntentEnabled,
  mapStateReconciliationHandoffErrorCode,
  stateReconciliationHandoffErrorCodes,
  stateReconciliationHandoffIntentKinds,
  stateReconciliationHandoffStates,
} from '@/features/operations/screens/scr-ops-004/state-reconciliation-handoff.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-004/state-reconciliation-handoff.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const handoff = {
  orderingReference: 'ORDER::opaque/OPS-004',
  optionReference: 'OPTION::opaque/OPS-004',
  targetHandoffCategoryReference: 'TARGET::opaque/OPS-004',
  structuredReasonReference: 'REASON::opaque/OPS-004',
  label: 'Caller handoff option',
  description: 'Caller handoff description',
  consequence: 'Caller handoff consequence',
  handoffAvailable: true,
} as const;
const snapshot = {
  workspaceReference: 'WORKSPACE::opaque/OPS-004',
  validationReference: 'VALIDATION::opaque/OPS-004',
  handoffReferences: ['HANDOFF::opaque/OPS-004'],
  affectedSubjectReferences: ['SUBJECT::opaque/OPS-004'],
  affectedScheduleReferences: ['SCHEDULE::opaque/OPS-004'],
  evidenceReferences: ['EVIDENCE::opaque/OPS-004'],
  auditReferences: ['AUDIT::opaque/OPS-004'],
  derivedStatusReferences: ['DERIVED::opaque/OPS-004'],
  reconciliationReferences: ['RECONCILIATION::opaque/OPS-004'],
  dependencyReferences: ['DEPENDENCY::opaque/OPS-004'],
  authorityStatusReference: 'AUTHORITY::opaque/OPS-004',
  lifecycleStatusReference: 'LIFECYCLE::opaque/OPS-004',
  handoffOptions: [handoff],
  selectedHandoffOptionReference: handoff.optionReference,
  retryContext: 'RETRY::opaque/OPS-004',
  reconciliationContext: 'RECONCILE::opaque/OPS-004',
} as const;
const visibility = {
  review_validation_context: true,
  submit_reconciliation_handoff: true,
  refresh_derived_status: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-004 state reconciliation handoff model', () => {
  it('preserves all incident-recovery state and error distinctions', () => {
    expect(stateReconciliationHandoffStates).toContain('empty');
    expect(stateReconciliationHandoffStates).toContain('offline_or_connectivity_unavailable');
    expect(stateReconciliationHandoffStates).toContain('sync_or_reconciliation_required');
    expect(stateReconciliationHandoffStates).toContain('authoritative_final');
    expect(stateReconciliationHandoffErrorCodes).toHaveLength(10);
    expect(mapStateReconciliationHandoffErrorCode('VALIDATION_FAILED')).toBe('validation_error');
    expect(mapStateReconciliationHandoffErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });

  it('preserves validation, subject, schedule, evidence, status, and handoff references exactly', () => {
    const viewModel = getStateReconciliationHandoffViewModel('ar', 'ready', snapshot, visibility);
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.validationReference).toBe(snapshot.validationReference);
    expect(viewModel.opaqueReferences.affectedSubjectReferences).toEqual(
      snapshot.affectedSubjectReferences,
    );
    expect(viewModel.opaqueReferences.affectedScheduleReferences).toEqual(
      snapshot.affectedScheduleReferences,
    );
    expect(viewModel.opaqueReferences.targetHandoffCategoryReferences).toEqual([
      handoff.targetHandoffCategoryReference,
    ]);
  });

  it('constructs only semantic handoff and derived-status intents without corrections', () => {
    expect(
      createStateReconciliationHandoffIntent('submit_reconciliation_handoff', snapshot),
    ).toEqual({
      kind: 'submit_reconciliation_handoff',
      workspaceReference: snapshot.workspaceReference,
      validationReference: snapshot.validationReference,
      targetHandoffCategoryReference: handoff.targetHandoffCategoryReference,
      affectedSubjectReferences: snapshot.affectedSubjectReferences,
      affectedScheduleReferences: snapshot.affectedScheduleReferences,
      structuredReasonReference: handoff.structuredReasonReference,
    });
    expect(
      isStateReconciliationHandoffIntentEnabled(
        'pending',
        'submit_reconciliation_handoff',
        snapshot,
      ),
    ).toBe(false);
    expect(isStateReconciliationHandoffIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(stateReconciliationHandoffIntentKinds).not.toContain('execute_correction');
  });

  it('contains no transport, persistence, route, correction, or authority implementation', () => {
    for (const forbidden of [
      '.sort(',
      '.toSorted(',
      'fetch(',
      'browserApiClient',
      'useRouter',
      'localStorage',
      'FormData',
      'providerClient',
      'validator_system_scope',
      'executeCorrection',
    ]) {
      expect(modelSource).not.toContain(forbidden);
    }
  });
});
