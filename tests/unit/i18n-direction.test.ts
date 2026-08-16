import { describe, expect, it } from 'vitest';

import { isolateMixedDirectionText } from '@/i18n/bidi';
import { directionForLocale } from '@/i18n/direction';

describe('i18n direction foundation', () => {
  it('maps English to LTR and Arabic to RTL', () => {
    expect(directionForLocale('en')).toBe('ltr');
    expect(directionForLocale('ar')).toBe('rtl');
  });

  it('isolates mixed-direction text with Unicode FSI/PDI', () => {
    const isolated = isolateMixedDirectionText('A / العربية / 42');
    expect(isolated.codePointAt(0)).toBe(0x2068);
    expect(isolated.codePointAt(isolated.length - 1)).toBe(0x2069);
  });
});
