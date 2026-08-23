import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-007/account-language-notices.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-007/account-language-notices.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-TRN-007 account language notices accessibility contract', () => {
  it('uses one primary heading and the governed semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="account-context"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="primary-task"');
    expect(component).toContain('data-region="disclosure-notice"');
    expect(component).toContain('data-region="notice-consequences"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
    expect(component).toContain('data-region="help-recovery"');
  });

  it('labels the controlled presentation selector and announces validation state', () => {
    expect(component).toContain('htmlFor="account-language-presentation"');
    expect(component).toContain('id="account-language-presentation"');
    expect(component).toContain('value={locale}');
    expect(component).toContain("aria-invalid={state === 'validation_error'}");
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
  });

  it('retains touch-sized controls and visible focus without navigation or transport', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
    expect(component).not.toContain('useRouter');
  });
});
