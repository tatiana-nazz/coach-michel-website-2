import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-001/today-training-status.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-001/today-training-status.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-TRN-001 today training status accessibility contract', () => {
  it('uses one primary heading and deterministic governed regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    for (const region of [
      'context-identity',
      'authority-lifecycle',
      'status-summary',
      'primary-task',
      'outcome-consequence',
      'governed-actions',
      'validation-feedback',
      'help-recovery',
    ])
      expect(component).toContain(`data-region="${region}"`);
  });
  it('announces caller state and busy work explicitly', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(component).toContain('{stateMessage}');
  });
  it('retains touch targets, visible focus, and neutral references without navigation', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(component).not.toContain('href=');
  });
});
