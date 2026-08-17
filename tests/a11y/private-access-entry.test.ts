import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-001/private-access-entry.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-001/private-access-entry.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-ACC-001 accessibility contract', () => {
  it('binds visible labels, status semantics and credential error relationships', () => {
    expect(component).toContain('htmlFor="private-access-email"');
    expect(component).toContain('htmlFor="private-access-password"');
    expect(component).toContain('role={viewModel.statusRole}');
    expect(component).toContain('aria-invalid={credentialStateInvalid}');
    expect(component).toContain('aria-describedby="private-access-status"');
  });

  it('keeps compact controls touch-sized with the governed visible focus treatment', () => {
    expect(styles).toContain('min-block-size: 44px;');
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(styles).toContain('outline-offset: var(--cmh-focus-offset);');
  });

  it('communicates state and external-service context with text rather than color alone', () => {
    expect(component).toContain('{viewModel.statusMessage}');
    expect(component).toContain('{copy.supportExternalLabel}');
    expect(component).toContain('aria-hidden="true"');
  });
});
