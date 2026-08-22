import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getPublicOverviewViewModel } from '@/features/public/screens/scr-pub-001/public-overview.model';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/public/screens/scr-pub-001/public-overview.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-001/public-overview.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-PUB-001 English and Arabic direction equivalence', () => {
  it('keeps equivalent state consequences while changing only text direction', () => {
    const english = getPublicOverviewViewModel('en', 'stale_or_conflicting_state');
    const arabic = getPublicOverviewViewModel('ar', 'stale_or_conflicting_state');

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
    expect(arabic.showInformation).toBe(english.showInformation);
  });

  it('uses one semantic source order with logical CSS properties for both directions', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(styles).toContain('margin-inline: auto;');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('margin-right:');
    expect(styles).not.toContain('padding-left:');
    expect(styles).not.toContain('padding-right:');
  });

  it('preserves opaque references exactly in Arabic presentation', () => {
    const approvedContentContext = 'CTX::neutral-AR-001';
    const reference = 'REF::7F9-opaque';
    const viewModel = getPublicOverviewViewModel('ar', 'ready', {
      approvedContentContext,
      reference,
    });

    expect(viewModel.opaqueReferences.approvedContentContext).toBe(approvedContentContext);
    expect(viewModel.opaqueReferences.reference).toBe(reference);
  });

  it('does not introduce direction-specific navigation or process reordering', () => {
    expect(component).not.toContain('href=');
    expect(styles).not.toContain('direction:');
  });
});
