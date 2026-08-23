import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getPublicCoachingPurposeViewModel } from '@/features/public/screens/scr-pub-002/public-coaching-purpose.model';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/public/screens/scr-pub-002/public-coaching-purpose.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL('../../src/features/public/screens/scr-pub-002/public-coaching-purpose.module.css', import.meta.url),
  ),
  'utf8',
);

describe('SCR-PUB-002 public coaching purpose English and Arabic direction equivalence', () => {
  it('keeps equivalent state consequences while changing only direction', () => {
    const english = getPublicCoachingPurposeViewModel('en', 'stale_or_conflicting_state');
    const arabic = getPublicCoachingPurposeViewModel('ar', 'stale_or_conflicting_state');

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
  });

  it('uses one source order and logical CSS properties for both directions', () => {
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
    const approvedContentContext = 'CTX::neutral-AR-002';
    const viewModel = getPublicCoachingPurposeViewModel('ar', 'ready', {
      approvedContentContext,
    });

    expect(viewModel.opaqueReferences.approvedContentContext).toBe(approvedContentContext);
  });

  it('does not introduce direction-specific navigation or process reordering', () => {
    expect(component).not.toContain('href=');
    expect(styles).not.toContain('direction:');
  });
});
