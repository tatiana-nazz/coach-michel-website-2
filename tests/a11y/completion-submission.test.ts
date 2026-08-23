import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-005/completion-submission.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-005/completion-submission.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-TRN-005 completion submission accessibility contract', () => {
  it('uses one primary heading and deterministic governed regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    for (const region of [
      'context-identity',
      'authority-lifecycle',
      'primary-task',
      'evidence-audit-context',
      'outcome-consequence',
      'governed-actions',
      'input-validation',
      'validation-feedback',
      'help-recovery',
    ])
      expect(component).toContain(`data-region="${region}"`);
  });

  it('announces validation, pending work, and caller-controlled state distinctly', () => {
    expect(component).toContain("role={viewModel.preflightIssues.length > 0 ? 'alert' : 'status'}");
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(component).toContain('content.durableFinalBody');
    expect(component).toContain('content.localAcknowledgementBody');
  });

  it('retains touch targets, visible focus, neutral references, and no navigation or upload', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('type="file"');
    expect(component).not.toContain('action=');
  });
});
