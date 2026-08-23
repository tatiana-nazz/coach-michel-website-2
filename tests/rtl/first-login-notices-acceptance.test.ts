import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getFirstLoginNoticesAcceptanceViewModel } from '@/features/access/screens/scr-acc-003/first-login-notices-acceptance.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-003/first-login-notices-acceptance.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-003/first-login-notices-acceptance.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const references = {
  principalReference: 'PRINCIPAL::neutral/AR-003',
  disclosureVersionReference: 'VERSION::neutral/AR-003',
  evidenceContext: 'EVIDENCE::neutral/AR-003',
} as const;

describe('SCR-ACC-003 English and Arabic direction equivalence', () => {
  it('keeps equivalent acceptance consequences while changing only direction', () => {
    const english = getFirstLoginNoticesAcceptanceViewModel('en', 'pending', references);
    const arabic = getFirstLoginNoticesAcceptanceViewModel('ar', 'pending', references);

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.actionsEnabled).toBe(english.actionsEnabled);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
  });

  it('preserves the exact current disclosure version in Arabic presentation', () => {
    const viewModel = getFirstLoginNoticesAcceptanceViewModel('ar', 'ready', references);

    expect(viewModel.opaqueReferences.disclosureVersionReference).toBe(
      references.disclosureVersionReference,
    );
    expect(viewModel.opaqueReferences.evidenceContext).toBe(references.evidenceContext);
  });

  it('uses one source order, semantic direction, and logical CSS properties', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('dir="ltr"');
    expect(styles).toContain('margin-inline: auto;');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('margin-right:');
    expect(styles).not.toContain('padding-left:');
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
