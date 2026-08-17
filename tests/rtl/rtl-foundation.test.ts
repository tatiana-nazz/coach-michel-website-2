import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { directionForLocale } from '@/i18n/direction';

const tokens = readFileSync(
  fileURLToPath(new URL('../../src/design-system/tokens.css', import.meta.url)),
  'utf8',
);

describe('Arabic RTL foundation', () => {
  it('uses semantic RTL direction for Arabic', () => {
    expect(directionForLocale('ar')).toBe('rtl');
  });

  it('binds Arabic typography through a direction selector rather than visual mirroring hacks', () => {
    expect(tokens).toContain("[dir='rtl']");
    expect(tokens).toContain('--cmh-font-arabic:');
  });
});
