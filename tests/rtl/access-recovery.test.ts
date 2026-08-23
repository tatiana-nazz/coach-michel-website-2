import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getAccessRecoveryViewModel } from '@/features/access/screens/scr-acc-004/access-recovery.model';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/access/screens/scr-acc-004/access-recovery.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/access/screens/scr-acc-004/access-recovery.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const values = {
  minimumRecoveryLocatorEvidence: 'LOCATOR::neutral/AR-004',
  requestedRecoveryPurpose: 'PURPOSE::neutral/AR-004',
} as const;

const authorityContext = {
  antiAbuseContext: 'ANTI-ABUSE::neutral/AR-004',
  principalAdminAuthorityContext: 'AUTHORITY::neutral/AR-004',
} as const;

const references = {
  recoveryReference: 'RECOVERY::neutral/AR-004',
  externalHandoffCorrelationReference: 'HANDOFF::neutral/AR-004',
} as const;

describe('SCR-ACC-004 English and Arabic direction equivalence', () => {
  it('keeps equivalent recovery consequences while changing only direction', () => {
    const english = getAccessRecoveryViewModel(
      'en',
      'recovery',
      values,
      authorityContext,
      references,
    );
    const arabic = getAccessRecoveryViewModel(
      'ar',
      'recovery',
      values,
      authorityContext,
      references,
    );

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
  });

  it('preserves all opaque recovery references exactly in Arabic presentation', () => {
    const viewModel = getAccessRecoveryViewModel(
      'ar',
      'recovery',
      values,
      authorityContext,
      references,
    );

    expect(viewModel.opaqueReferences.minimumRecoveryLocatorEvidence).toBe(
      values.minimumRecoveryLocatorEvidence,
    );
    expect(viewModel.opaqueReferences.antiAbuseContext).toBe(authorityContext.antiAbuseContext);
    expect(viewModel.opaqueReferences.recoveryReference).toBe(references.recoveryReference);
    expect(viewModel.opaqueReferences.externalHandoffCorrelationReference).toBe(
      references.externalHandoffCorrelationReference,
    );
  });

  it('uses one source order, semantic direction, and logical CSS properties', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain("field === 'minimumRecoveryLocatorEvidence' ? 'ltr' : undefined");
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
