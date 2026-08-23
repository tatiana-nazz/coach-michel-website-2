import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getExternalSupportHandoffViewModel } from '@/features/trainee/screens/scr-trn-008/external-support-handoff.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-008/external-support-handoff.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-008/external-support-handoff.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  boundedPrincipalContextReference: 'PRINCIPAL-CONTEXT::neutral/AR-008',
  requestCategoryOptions: [],
  minimumRoutingFacts: [],
  routeStatusOptions: [],
  structuredReasonOptions: [],
  minimumEvidenceReferences: [],
} as const;

const visibility = {
  initiate_support_privacy: true,
  route_or_escalate: true,
  external_handoff: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-TRN-008 English and Arabic direction equivalence', () => {
  it('keeps handoff state and consequences equivalent while changing only direction', () => {
    const english = getExternalSupportHandoffViewModel(
      'en',
      'local_acknowledgement',
      snapshot,
      visibility,
    );
    const arabic = getExternalSupportHandoffViewModel(
      'ar',
      'local_acknowledgement',
      snapshot,
      visibility,
    );

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
    expect(arabic.consequence).toBe(english.consequence);
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
