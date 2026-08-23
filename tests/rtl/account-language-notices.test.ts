import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getAccountLanguageNoticesViewModel } from '@/features/trainee/screens/scr-trn-007/account-language-notices.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-007/account-language-notices.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-007/account-language-notices.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  accountReference: 'ACCOUNT::neutral/AR-007',
  authorityStatusReference: 'AUTHORITY::neutral/AR-007',
  notices: [
    {
      noticeReference: 'NOTICE::neutral/AR-007',
      heading: 'عنوان يقدمه المستدعي',
      body: 'نص يقدمه المستدعي',
    },
  ],
} as const;

const visibility = { refresh_notices: true, retry: true, reconcile: true } as const;

describe('SCR-TRN-007 English and Arabic direction equivalence', () => {
  it('keeps account and notice consequences equivalent while changing only direction', () => {
    const english = getAccountLanguageNoticesViewModel('en', 'pending', snapshot, visibility);
    const arabic = getAccountLanguageNoticesViewModel('ar', 'pending', snapshot, visibility);

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
    expect(arabic.visibleIntents).toEqual(english.visibleIntents);
    expect(arabic.opaqueReferences).toEqual(english.opaqueReferences);
  });

  it('uses one source order, semantic direction, logical CSS, and neutral references', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
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
