import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createRecoveryOperationIntent,
  getRecoveryOperationViewModel,
  isRecoveryOperationIntentEnabled,
  mapRecoveryOperationErrorCode,
  recoveryOperationErrorCodes,
  recoveryOperationIntentKinds,
  recoveryOperationStates,
} from '@/features/operations/screens/scr-ops-002/recovery-operation.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-002/recovery-operation.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const activity = {
  orderingReference: 'ORDER::opaque/OPS-002',
  optionReference: 'OPTION::opaque/OPS-002',
  activityCategoryReference: 'CATEGORY::opaque/OPS-002',
  governedStatusReference: 'STATUS::opaque/OPS-002',
  structuredReasonReference: 'REASON::opaque/OPS-002',
  evidenceToolReferences: ['TOOL-EVIDENCE::opaque/OPS-002'],
  label: 'Caller activity',
  description: 'Caller activity description',
  consequence: 'Caller activity consequence',
  intentAvailable: true,
} as const;
const snapshot = {
  workspaceReference: 'WORKSPACE::opaque/OPS-002',
  incidentReference: 'INCIDENT::opaque/OPS-002',
  recoveryActivityReferences: ['ACTIVITY::opaque/OPS-002'],
  governedCommandReferences: ['COMMAND::opaque/OPS-002'],
  evidenceReferences: ['EVIDENCE::opaque/OPS-002'],
  auditReferences: ['AUDIT::opaque/OPS-002'],
  dependencyReferences: ['DEPENDENCY::opaque/OPS-002'],
  externalHandoffCorrelationReferences: ['CORRELATION::opaque/OPS-002'],
  authorityStatusReference: 'AUTHORITY::opaque/OPS-002',
  lifecycleStatusReference: 'LIFECYCLE::opaque/OPS-002',
  activityOptions: [activity],
  selectedActivityOptionReference: activity.optionReference,
  retryContext: 'RETRY::opaque/OPS-002',
  reconciliationContext: 'RECONCILE::opaque/OPS-002',
} as const;
const visibility = {
  review_incident_recovery_context: true,
  review_governed_command_context: true,
  submit_recovery_activity: true,
  external_handoff: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-002 recovery operation model', () => {
  it('preserves all incident-recovery state and error distinctions', () => {
    expect(recoveryOperationStates).toContain('empty');
    expect(recoveryOperationStates).toContain('offline_or_connectivity_unavailable');
    expect(recoveryOperationStates).toContain('sync_or_reconciliation_required');
    expect(recoveryOperationStates).toContain('authoritative_final');
    expect(recoveryOperationErrorCodes).toHaveLength(10);
    expect(mapRecoveryOperationErrorCode('VALIDATION_FAILED')).toBe('validation_error');
    expect(mapRecoveryOperationErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
  });

  it('preserves activity, command, evidence, dependency, and handoff references exactly', () => {
    const viewModel = getRecoveryOperationViewModel('ar', 'ready', snapshot, visibility);
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.recoveryActivityReferences).toEqual(
      snapshot.recoveryActivityReferences,
    );
    expect(viewModel.opaqueReferences.governedCommandReferences).toEqual(
      snapshot.governedCommandReferences,
    );
    expect(viewModel.opaqueReferences.activityCategoryReferences).toEqual([
      activity.activityCategoryReference,
    ]);
    expect(viewModel.opaqueReferences.externalHandoffCorrelationReferences).toEqual(
      snapshot.externalHandoffCorrelationReferences,
    );
  });

  it('constructs a semantic activity intent without executing a command or selecting an adapter', () => {
    expect(createRecoveryOperationIntent('submit_recovery_activity', snapshot)).toEqual({
      kind: 'submit_recovery_activity',
      workspaceReference: snapshot.workspaceReference,
      incidentReference: snapshot.incidentReference,
      activityCategoryReference: activity.activityCategoryReference,
      governedStatusReference: activity.governedStatusReference,
      structuredReasonReference: activity.structuredReasonReference,
      evidenceToolReferences: activity.evidenceToolReferences,
    });
    expect(isRecoveryOperationIntentEnabled('pending', 'submit_recovery_activity', snapshot)).toBe(
      false,
    );
    expect(isRecoveryOperationIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(recoveryOperationIntentKinds).not.toContain('execute_recovery_command');
  });

  it('contains no transport, persistence, route, provider, tooling, or authority implementation', () => {
    for (const forbidden of [
      '.sort(',
      '.toSorted(',
      'fetch(',
      'browserApiClient',
      'useRouter',
      'localStorage',
      'FormData',
      'providerClient',
      'operator_system_scope',
      'runbook',
    ]) {
      expect(modelSource).not.toContain(forbidden);
    }
  });
});
