import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/coach/screens/scr-coa-007/scheduling-release.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-007/scheduling-release.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-007 scheduling and release accessibility contract', () => {
  it('uses one primary heading and the complete context-workspace region sequence', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="schedule-release-planning"');
    expect(component).toContain('data-region="structured-reason"');
    expect(component).toContain('data-region="evidence-audit-context"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('announces loading, pending, errors, and status without a local release form', () => {
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).not.toContain('<form');
    expect(component).not.toContain('type="datetime-local"');
  });

  it('keeps touch-sized visible focus and excludes navigation or transport', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
  });
});
