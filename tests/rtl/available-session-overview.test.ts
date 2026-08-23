import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getAvailableSessionOverviewViewModel } from '@/features/trainee/screens/scr-trn-002/available-session-overview.model';
const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-002/available-session-overview.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-002/available-session-overview.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const item = {
  workReference: 'WORK::neutral/AR-002',
  heading: 'عمل',
  description: 'وصف',
  statusLabel: 'حالة',
  availableForIntent: true,
} as const;
const snapshot = {
  sessionReference: 'SESSION::neutral/AR-002',
  sessionHeading: 'جلسة',
  sessionStatus: 'حالة',
  sessionSummary: 'ملخص',
  approvedWork: [item],
} as const;
const visibility = { request_approved_work: true, retry: false, reconcile: false } as const;
describe('SCR-TRN-002 English and Arabic direction equivalence', () => {
  it('changes direction without changing state or visible intent consequence', () => {
    const en = getAvailableSessionOverviewViewModel(
      'en',
      'ready',
      snapshot,
      item.workReference,
      visibility,
    );
    const ar = getAvailableSessionOverviewViewModel(
      'ar',
      'ready',
      snapshot,
      item.workReference,
      visibility,
    );
    expect(en.direction).toBe('ltr');
    expect(ar.direction).toBe('rtl');
    expect(ar.state).toBe(en.state);
    expect(ar.visibleIntents).toEqual(en.visibleIntents);
  });
  it('preserves session and work references in Arabic', () => {
    const model = getAvailableSessionOverviewViewModel(
      'ar',
      'ready',
      snapshot,
      item.workReference,
      visibility,
    );
    expect(model.opaqueReferences.sessionReference).toBe(snapshot.sessionReference);
    expect(model.opaqueReferences.selectedWorkReference).toBe(item.workReference);
    expect(model.opaqueReferences.workReferences).toEqual([item.workReference]);
  });
  it('uses semantic direction, neutral references, and logical CSS', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(styles).toContain('margin-inline:');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('direction:');
  });
});
