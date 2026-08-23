import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-005/session-preparation.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-005/session-preparation.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-005 session preparation accessibility contract', () => {
  it('uses one primary heading and every governed context-workspace region', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="primary-task"');
    expect(component).toContain('data-region="progress-sequence"');
    expect(component).toContain('data-region="supporting-detail"');
    expect(component).toContain('data-region="evidence-audit-context"');
    expect(component).toContain('data-region="context-consequence"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
    expect(component).toContain('data-region="help-recovery"');
  });

  it('uses deterministic ordered exercise and sequence content with neutral references', () => {
    expect(component.match(/<ol\b/g)).toHaveLength(2);
    expect(component).toContain('key={exercise.orderingReference}');
    expect(component).toContain('key={step.orderingReference}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
  });

  it('announces feedback and consequence changes without claiming durable completion locally', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain('data-consequence={viewModel.consequence}');
    expect(component).toContain('content.authoritativeFinalConsequenceBody');
  });

  it('retains touch-sized visible focus without navigation, transport, or browser persistence', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
    expect(component).not.toContain('useRouter');
    expect(component).not.toContain('localStorage');
  });
});
