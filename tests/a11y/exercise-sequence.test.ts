import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-003/exercise-sequence.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-003/exercise-sequence.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
describe('SCR-TRN-003 exercise sequence accessibility contract', () => {
  it('uses one primary heading and governed sequence regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    for (const region of [
      'context-identity',
      'authority-lifecycle',
      'progress-sequence',
      'primary-task',
      'outcome-consequence',
      'governed-actions',
      'validation-feedback',
      'help-recovery',
    ])
      expect(component).toContain(`data-region="${region}"`);
  });
  it('uses native ordered-list, progress, and current-step semantics', () => {
    expect(component).toContain('<ol');
    expect(component).toContain('<progress');
    expect(component).toContain("aria-current={current ? 'step' : undefined}");
    expect(component).toContain('value={snapshot.progressValue}');
    expect(component).toContain('max={snapshot.progressMaximum}');
  });
  it('announces state and keeps controls focused without navigation', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('href=');
  });
});
