import { describe, expect, it } from 'vitest';

import tokens from '../../src/design-system/tokens.css?raw';

describe('accessibility foundation', () => {
  it('preserves the governed solid focus ring and non-blue semantic state channels', () => {
    expect(tokens).toContain('--cmh-blue-focus: #005fcc;');
    expect(tokens).toContain('--cmh-focus-width: 2px;');
    expect(tokens).toContain('--cmh-state-danger: #a63a32;');
    expect(tokens).toContain('--cmh-state-success: #0a7452;');
    expect(tokens).toContain('--cmh-state-warning: #8a5a00;');
  });

  it('contains a reduced-motion override', () => {
    expect(tokens).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
