import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-003/first-login-notices-acceptance.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-003/first-login-notices-acceptance.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-ACC-003 first-login notices and acceptance accessibility contract', () => {
  it('uses one primary heading and deterministic governed semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="primary-task"');
    expect(component).toContain('data-region="disclosure-notice"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
    expect(component).toContain('data-region="help-recovery"');
  });

  it('exposes notice headings, exact version references, and consequence before actions', () => {
    expect(component).toContain('<h3>{notice.heading}</h3>');
    expect(component).toContain('{notice.body}');
    expect(component).toContain('{references.disclosureVersionReference}');
    expect(component).toContain('{content.consequenceBody}');
    expect(component.indexOf('{content.consequenceBody}')).toBeLessThan(
      component.indexOf('{copy.responseLabels[response]}'),
    );
  });

  it('announces authoritative state and disables intent outside ready state', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain("aria-busy={state === 'pending'}");
    expect(component).toContain('disabled={!viewModel.actionsEnabled}');
    expect(component).toContain('{stateMessage}');
  });

  it('retains touch-sized controls and governed visible focus without navigation', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(component).not.toContain('href=');
  });
});
