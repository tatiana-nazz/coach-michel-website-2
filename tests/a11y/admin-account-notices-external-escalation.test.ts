import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-010/admin-account-notices-external-escalation.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-010/admin-account-notices-external-escalation.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-010 admin account and handoff accessibility contract', () => {
  it('uses one primary heading and all governed LA-010 semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="primary-task-information"');
    expect(component).toContain('data-region="disclosure-notice"');
    expect(component).toContain('data-region="help-recovery-external-handoff"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('preserves ordered notice/context collections and a labelled controlled handoff selector', () => {
    expect(component.match(/<ol className=\{styles.itemList\}>/g)).toHaveLength(3);
    expect(component).toContain('key={notice.orderingReference}');
    expect(component).toContain('key={context.orderingReference}');
    expect(component).toContain('key={caseItem.orderingReference}');
    expect(component).toContain('htmlFor="admin-account-handoff-option"');
    expect(component.match(/<select\b/g)).toHaveLength(1);
    expect(component).toContain("aria-invalid={state === 'validation_error'}");
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
  });

  it('announces status/errors and keeps touch-sized focus without free text, uploads, routes, or transport', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('<form');
    expect(component).not.toContain('<textarea');
    expect(component).not.toContain('type="file"');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
  });
});
