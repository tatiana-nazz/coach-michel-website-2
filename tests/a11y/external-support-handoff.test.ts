import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-008/external-support-handoff.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-008/external-support-handoff.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-TRN-008 external support handoff accessibility contract', () => {
  it('uses one primary heading and deterministic governed semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="primary-task"');
    expect(component).toContain('data-region="minimum-routing-facts"');
    expect(component).toContain('data-region="routing-escalation"');
    expect(component).toContain('data-region="integrity-evidence"');
    expect(component).toContain('data-region="external-handoff"');
    expect(component).toContain('data-region="handoff-consequences"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('labels all governed controlled selections and announces invalid state', () => {
    expect(component).toContain('htmlFor="external-support-request-category"');
    expect(component).toContain('htmlFor="external-support-route-status"');
    expect(component).toContain('htmlFor="external-support-reason"');
    expect(component.match(/<select\b/g)).toHaveLength(3);
    expect(component.match(/aria-invalid=\{state === 'validation_error'\}/g)).toHaveLength(3);
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
  });

  it('offers no messaging, free-text, or upload control', () => {
    expect(component).not.toContain('<textarea');
    expect(component).not.toContain('type="text"');
    expect(component).not.toContain('type="file"');
    expect(component).not.toContain('contentEditable');
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
