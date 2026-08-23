import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/public/screens/scr-pub-004/public-disclosures.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL('../../src/features/public/screens/scr-pub-004/public-disclosures.module.css', import.meta.url),
  ),
  'utf8',
);

describe('SCR-PUB-004 public disclosures accessibility contract', () => {
  it('uses one primary heading and deterministic governed semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="primary-information"');
    expect(component).toContain('data-region="supporting-detail"');
    expect(component).toContain('data-region="disclosure-notice"');
    expect(component).toContain('data-region="help-recovery"');
    expect(component).toContain('data-region="system-feedback"');
  });

  it('applies language, direction, status and alert semantics consistently', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
  });

  it('communicates state with visible text and a decorative marker rather than color alone', () => {
    expect(component).toContain('{stateMessage}');
    expect(component).toContain('aria-hidden="true"');
    expect(component).toContain('data-feedback-tone={viewModel.feedbackTone}');
  });

  it('retains governed focus styling without adding navigation or transport', () => {
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(styles).toContain('outline-offset: var(--cmh-focus-offset);');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('browserApiClient');
    expect(component).not.toContain('operationRegistry');
    expect(component).not.toContain('fetch(');
  });
});
