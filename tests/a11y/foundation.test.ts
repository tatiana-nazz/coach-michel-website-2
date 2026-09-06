import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const tokens = readFileSync(
  fileURLToPath(new URL('../../src/design-system/tokens.css', import.meta.url)),
  'utf8',
);

const globals = readFileSync(
  fileURLToPath(new URL('../../src/app/globals.css', import.meta.url)),
  'utf8',
);

describe('accessibility foundation', () => {
  it('preserves the governed solid focus ring and non-blue semantic state channels', () => {
    expect(tokens).toContain('--cmh-blue-focus: #034fc7;');
    expect(tokens).toContain('--cmh-focus-width: 2px;');
    expect(tokens).toContain('--cmh-state-danger: #b42318;');
    expect(tokens).toContain('--cmh-state-success: #0f6b50;');
    expect(tokens).toContain('--cmh-state-warning: #8a4b00;');
  });

  it('contains a reduced-motion override', () => {
    expect(globals).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
