import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-002/provisioning-invitation-entry.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-002/provisioning-invitation-entry.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-ACC-002 provisioning or invitation entry accessibility contract', () => {
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

  it('binds every controlled field to a visible label and description', () => {
    expect(component).toContain('<label htmlFor={inputId}>');
    expect(component).toContain('aria-describedby={`${descriptionId} provisioning-feedback`}');
    expect(component).toContain('aria-invalid={validationInvalid}');
    expect(component).toContain('value={values[field]}');
  });

  it('announces caller-controlled state and disables unavailable intents', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain("aria-busy={state === 'pending'}");
    expect(component).toContain('disabled={!isProvisioningIntentEnabled(state, kind)}');
    expect(component).toContain('{stateMessage}');
  });

  it('retains touch-sized controls and governed visible focus', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(styles).toContain('outline-offset: var(--cmh-focus-offset);');
  });
});
