import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

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

describe('SCR-TRN-006 confirmation and reconciliation accessibility contract', () => {
  it('uses one primary heading and deterministic governed regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    for (const region of [
      'context-identity',
      'authority-lifecycle',
      'system-state-resumption',
      'primary-task',
      'evidence-audit-context',
      'outcome-consequence',
      'governed-actions',
      'validation-feedback',
      'recovery-resumption',
      'help-recovery',
    ])
      expect(component).toContain(`data-region="${region}"`);
  });

  it('announces pending work and preserves distinct local, existing, and durable consequences', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(component).toContain('content.localOutcomeBody');
    expect(component).toContain('content.existingCompletionBody');
    expect(component).toContain('content.durableConfirmedBody');
    expect(component).toContain('data-outcome-kind={viewModel.outcomeKind}');
  });

  it('retains touch targets, visible focus, neutral references, and no navigation', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('action=');
  });
});
