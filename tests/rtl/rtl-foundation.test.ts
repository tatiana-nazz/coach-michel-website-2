import { describe, expect, it } from 'vitest';

import tokens from '../../src/design-system/tokens.css?raw';
import { directionForLocale } from '@/i18n/direction';

describe('Arabic RTL foundation', () => {
  it('uses semantic RTL direction for Arabic', () => {
    expect(directionForLocale('ar')).toBe('rtl');
  });

  it('binds Arabic typography through a direction selector rather than visual mirroring hacks', () => {
    expect(tokens).toContain("[dir='rtl']");
    expect(tokens).toContain('--cmh-font-arabic:');
  });
});
