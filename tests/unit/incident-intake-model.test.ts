import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createIncidentIntakeIntent,
  getIncidentIntakeViewModel,
  incidentIntakeErrorCodes,
  incidentIntakeIntentKinds,
  incidentIntakeStates,
  isIncidentIntakeIntentEnabled,
  mapIncidentIntakeErrorCode,
} from '@/features/operations/screens/scr-ops-001/incident-intake.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-001/incident-intake.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);
const category = {
  orderingReference: 'ORDER::opaque/OPS-001',
  categoryReference: 'CATEGORY::opaque/OPS-001',
  label: 'Caller category',
  description: 'Caller description',
  consequence: 'Caller consequence',
  intakeAvailable: true,
} as const;
const snapshot = {
  workspaceReference: 'WORKSPACE::opaque/OPS-001',
  incidentReferences: ['INCIDENT::opaque/OPS-001'],
  affectedReferences: ['AFFECTED::opaque/OPS-001'],
  supportCaseReferences: ['CASE::opaque/OPS-001'],
  privacyContextReferences: ['PRIVACY::opaque/OPS-001'],
  evidenceReferences: ['EVIDENCE::opaque/OPS-001'],
  auditReferences: ['AUDIT::opaque/OPS-001'],
  dependencyReferences: ['DEPENDENCY::opaque/OPS-001'],
  authorityStatusReference: 'AUTHORITY::opaque/OPS-001',
  lifecycleStatusReference: 'LIFECYCLE::opaque/OPS-001',
  categories: [category],
  selectedCategoryReference: category.categoryReference,
  retryContext: 'RETRY::opaque/OPS-001',
  reconciliationContext: 'RECONCILE::opaque/OPS-001',
} as const;
const visibility = {
  review_incident_context: true,
  review_support_privacy_context: true,
  submit_incident_classification: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-OPS-001 incident intake model', () => {
  it('preserves all incident-recovery state and error distinctions', () => {
    expect(incidentIntakeStates).toContain('empty');
    expect(incidentIntakeStates).toContain('offline_or_connectivity_unavailable');
    expect(incidentIntakeStates).toContain('sync_or_reconciliation_required');
    expect(incidentIntakeStates).toContain('authoritative_final');
    expect(incidentIntakeErrorCodes).toHaveLength(10);
    expect(mapIncidentIntakeErrorCode('VALIDATION_FAILED')).toBe('validation_error');
    expect(mapIncidentIntakeErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
  });

  it('preserves every operational reference exactly and never derives ordering', () => {
    const viewModel = getIncidentIntakeViewModel('ar', 'ready', snapshot, visibility);
    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.incidentReferences).toEqual(snapshot.incidentReferences);
    expect(viewModel.opaqueReferences.affectedReferences).toEqual(snapshot.affectedReferences);
    expect(viewModel.opaqueReferences.categoryReferences).toEqual([category.categoryReference]);
    expect(viewModel.opaqueReferences.orderingReferences).toEqual([category.orderingReference]);
  });

  it('constructs only gated semantic classification, retry, and reconciliation intents', () => {
    expect(createIncidentIntakeIntent('submit_incident_classification', snapshot)).toEqual({
      kind: 'submit_incident_classification',
      workspaceReference: snapshot.workspaceReference,
      categoryReference: category.categoryReference,
      affectedReferences: snapshot.affectedReferences,
      evidenceReferences: snapshot.evidenceReferences,
      dependencyReferences: snapshot.dependencyReferences,
    });
    expect(
      isIncidentIntakeIntentEnabled('pending', 'submit_incident_classification', snapshot),
    ).toBe(false);
    expect(isIncidentIntakeIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(incidentIntakeIntentKinds).not.toContain('execute_incident_command');
  });

  it('contains no transport, persistence, route, upload, or client authority implementation', () => {
    for (const forbidden of [
      '.sort(',
      '.toSorted(',
      'fetch(',
      'browserApiClient',
      'useRouter',
      'localStorage',
      'FormData',
      'providerClient',
      'operator_handler_scope',
    ]) {
      expect(modelSource).not.toContain(forbidden);
    }
  });
});
