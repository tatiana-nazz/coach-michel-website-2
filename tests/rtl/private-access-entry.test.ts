import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getPrivateAccessEntryViewModel } from '@/features/access/screens/scr-acc-001/private-access-entry.model';

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

describe('SCR-ACC-001 Arabic RTL behavior', () => {
  it('uses semantic direction from the locale view model', () => {
    expect(getPrivateAccessEntryViewModel('ar', 'default').direction).toBe('rtl');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('lang={activeLocale}');
  });

  it('keeps email direction isolated while the surrounding interface reflows', () => {
    expect(component).toContain('dir="ltr"');
    expect(styles).toContain('margin-inline: auto;');
    expect(styles).toContain('border-inline-start:');
    expect(styles).toContain('inset-inline-start: 0;');
  });

  it('exposes the English and Arabic locale choices without adding a route', () => {
    expect(component).toContain('<option value="en">English</option>');
    expect(component).toContain('<option value="ar">العربية</option>');
    expect(component).toContain('setActiveLocale');
  });
});
