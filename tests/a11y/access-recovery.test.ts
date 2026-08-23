import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/access/screens/scr-acc-004/access-recovery.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-004/access-recovery.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-ACC-004 access recovery accessibility contract', () => {
  it('uses one primary heading and deterministic governed semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="primary-task"');
    expect(component).toContain('data-region="disclosure-notice"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
    expect(component).toContain('data-region="help-recovery"');
    expect(component).toContain('data-region="external-handoff"');
  });

  it('binds controlled recovery fields to visible labels and descriptions', () => {
    expect(component).toContain('<label htmlFor={inputId}>');
    expect(component).toContain('aria-describedby={`${descriptionId} access-recovery-feedback`}');
    expect(component).toContain('aria-invalid={validationInvalid}');
    expect(component).toContain('value={values[field]}');
  });

  it('announces caller-controlled state and disables unavailable intents', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain("aria-busy={state === 'pending'}");
    expect(component).toContain('disabled={!isAccessRecoveryIntentEnabled(state, kind)}');
    expect(component).toContain('{stateMessage}');
  });

  it('retains touch-sized controls and governed visible focus without a URL handoff', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(component).not.toContain('href=');
  });
});
