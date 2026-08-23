import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createRecoveryValidationIntent,
  getRecoveryValidationViewModel,
  isRecoveryValidationIntentEnabled,
  mapRecoveryValidationErrorCode,
  recoveryValidationErrorCodes,
  recoveryValidationIntentKinds,
  recoveryValidationStates,
} from '@/features/operations/screens/scr-ops-003/recovery-validation.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-003/recovery-validation.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const objective = {
  orderingReference: 'ORDER-OBJECTIVE::opaque/OPS-003',
  objectiveReference: 'OBJECTIVE::opaque/OPS-003',
  priorConfirmationEvidenceReferences: ['CONFIRMATION::opaque/OPS-003'],
  heading: 'Caller objective',
  statusLabel: 'Caller objective status',
  summary: 'Caller objective summary',
  reviewAvailable: true,
} as const;
const decision = {
  orderingReference: 'ORDER-DECISION::opaque/OPS-003',
  optionReference: 'OPTION::opaque/OPS-003',
  decisionCategoryReference: 'DECISION::opaque/OPS-003',
  structuredReasonReference: 'REASON::opaque/OPS-003',
  independenceExceptionEvidenceReferences: ['INDEPENDENCE::opaque/OPS-003'],
  label: 'Caller validation option',
  description: 'Caller validation description',
  consequence: 'Caller validation consequence',
  submitAvailable: true,
} as const;
const snapshot = {
  workspaceReference: 'WORKSPACE::opaque/OPS-003',
  recoveryActivityReference: 'ACTIVITY::opaque/OPS-003',
  validationReferences: ['VALIDATION::opaque/OPS-003'],
  objectives: [objective],
  evidenceReferences: ['EVIDENCE::opaque/OPS-003'],
  auditReferences: ['AUDIT::opaque/OPS-003'],
  dependencyReferences: ['DEPENDENCY::opaque/OPS-003'],
  validatorStatusReference: 'VALIDATOR-STATUS::opaque/OPS-003',
  authorityStatusReference: 'AUTHORITY::opaque/OPS-003',
  lifecycleStatusReference: 'LIFECYCLE::opaque/OPS-003',
  decisions: [decision],
  selectedDecisionOptionReference: decision.optionReference,
  retryContext: 'RETRY::opaque/OPS-003',
  reconciliationContext: 'RECONCILE::opaque/OPS-003',
} as const;
const visibility = {
  review_recovery_activity_context: true,
  review_objective: true,
  submit_validation: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-003 recovery validation model', () => {
  it('preserves all incident-recovery state and error distinctions', () => {
    expect(recoveryValidationStates).toContain('empty');
    expect(recoveryValidationStates).toContain('offline_or_connectivity_unavailable');
    expect(recoveryValidationStates).toContain('sync_or_reconciliation_required');
    expect(recoveryValidationStates).toContain('authoritative_final');
    expect(recoveryValidationErrorCodes).toHaveLength(10);
    expect(mapRecoveryValidationErrorCode('VALIDATION_FAILED')).toBe('validation_error');
    expect(mapRecoveryValidationErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
  });

  it('preserves activity, objective, confirmation, validation, and evidence references exactly', () => {
    const viewModel = getRecoveryValidationViewModel('ar', 'ready', snapshot, visibility);
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.recoveryActivityReference).toBe(
      snapshot.recoveryActivityReference,
    );
    expect(viewModel.opaqueReferences.objectiveReferences).toEqual([objective.objectiveReference]);
    expect(viewModel.opaqueReferences.priorConfirmationEvidenceReferences).toEqual(
      objective.priorConfirmationEvidenceReferences,
    );
    expect(viewModel.opaqueReferences.decisionCategoryReferences).toEqual([
      decision.decisionCategoryReference,
    ]);
  });

  it('constructs only a gated semantic validation intent without inferring finality', () => {
    expect(createRecoveryValidationIntent('submit_validation', snapshot)).toEqual({
      kind: 'submit_validation',
      workspaceReference: snapshot.workspaceReference,
      recoveryActivityReference: snapshot.recoveryActivityReference,
      decisionCategoryReference: decision.decisionCategoryReference,
      structuredReasonReference: decision.structuredReasonReference,
      recoveryActivityEvidenceReferences: snapshot.evidenceReferences,
      independenceExceptionEvidenceReferences: decision.independenceExceptionEvidenceReferences,
    });
    expect(isRecoveryValidationIntentEnabled('pending', 'submit_validation', snapshot)).toBe(false);
    expect(isRecoveryValidationIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(recoveryValidationIntentKinds).not.toContain('declare_authoritative_final');
  });

  it('contains no transport, persistence, route, recovery execution, or authority implementation', () => {
    for (const forbidden of [
      '.sort(',
      '.toSorted(',
      'fetch(',
      'browserApiClient',
      'useRouter',
      'localStorage',
      'FormData',
      'providerClient',
      'validator_role_scope',
      'executeRecovery',
    ]) {
      expect(modelSource).not.toContain(forbidden);
    }
  });
});
