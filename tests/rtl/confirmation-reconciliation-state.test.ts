import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getConfirmationReconciliationViewModel } from '@/features/trainee/screens/scr-trn-006/confirmation-reconciliation-state.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-006/confirmation-reconciliation-state.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-006/confirmation-reconciliation-state.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const snapshot = {
  scheduleCompletionOrCaseReference: 'CASE::neutral/AR-006',
  statusReference: 'STATUS::neutral/AR-006',
  statusHeading: 'حالة',
  statusBody: 'وصف',
  evidenceReferences: ['EVIDENCE::neutral/AR-006'],
} as const;
const visibility = {
  refresh_projection: false,
  reconcile: true,
  retry: false,
} as const;

describe('SCR-TRN-006 English and Arabic direction equivalence', () => {
  it('changes direction without changing uncertain consequence', () => {
    const en = getConfirmationReconciliationViewModel('en', 'uncertain', snapshot, visibility);
    const ar = getConfirmationReconciliationViewModel('ar', 'uncertain', snapshot, visibility);
    expect(en.direction).toBe('ltr');
    expect(ar.direction).toBe('rtl');
    expect(ar.state).toBe(en.state);
    expect(ar.feedbackRole).toBe(en.feedbackRole);
    expect(ar.feedbackTone).toBe(en.feedbackTone);
    expect(ar.requiresReconciliation).toBe(en.requiresReconciliation);
    expect(ar.durableConfirmed).toBe(false);
  });

  it('preserves opaque case, status, and evidence references exactly', () => {
    const model = getConfirmationReconciliationViewModel(
      'ar',
      'existing_completion',
      snapshot,
      visibility,
    );
    expect(model.opaqueReferences.scheduleCompletionOrCaseReference).toBe(
      snapshot.scheduleCompletionOrCaseReference,
    );
    expect(model.opaqueReferences.statusReference).toBe(snapshot.statusReference);
    expect(model.opaqueReferences.evidenceReferences).toEqual(snapshot.evidenceReferences);
    expect(model.outcomeKind).toBe('existing_completion');
  });

  it('uses shared direction and logical CSS without direction-specific ordering', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(styles).toContain('margin-inline:');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
