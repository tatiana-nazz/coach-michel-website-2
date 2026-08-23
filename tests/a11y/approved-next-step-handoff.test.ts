import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-005/approved-next-step-handoff.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-005/approved-next-step-handoff.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-PUB-005 approved next-step handoff accessibility contract', () => {
  it('uses one primary heading and deterministic governed semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="primary-task"');
    expect(component).toContain('data-region="disclosure-notice"');
    expect(component).toContain('data-region="support-privacy"');
    expect(component).toContain('data-region="external-handoff"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('binds controlled options to labels, descriptions, and caller state', () => {
    expect(component).toContain('htmlFor={optionId}');
    expect(component).toContain('type="radio"');
    expect(component).toContain('checked={selectedOptionReference === option.optionReference}');
    expect(component).toContain(
      'aria-describedby={`${descriptionId} approved-next-step-feedback`}',
    );
    expect(component).toContain('<fieldset');
    expect(component).toContain('aria-invalid={validationInvalid}');
  });

  it('announces explicit consequence state and keeps pending controls deterministic', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain("aria-busy={state === 'pending'}");
    expect(component).toContain('disabled={!viewModel.optionSelectionEnabled}');
    expect(component).toContain('{stateMessage}');
  });

  it('retains touch-sized controls and visible focus without navigation or direct transport', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
    expect(component).not.toContain('useRouter');
  });
});
