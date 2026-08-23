import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getApprovedNextStepHandoffViewModel } from '@/features/public/screens/scr-pub-005/approved-next-step-handoff.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-005/approved-next-step-handoff.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-005/approved-next-step-handoff.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

const option = {
  optionReference: 'OPTION::neutral/AR-005',
  category: 'CATEGORY::neutral/AR-005',
  value: 'VALUE::neutral/AR-005',
  heading: 'عنوان يقدمه المستدعي',
  description: 'وصف يقدمه المستدعي',
} as const;

const visibility = {
  request_next_step: true,
  support_privacy: true,
  external_handoff: true,
  retry: true,
  reconcile: true,
} as const;

const externalContext = {
  correlationReference: 'CORRELATION::neutral/AR-005',
  minimumBusinessIntent: 'INTENT::neutral/AR-005',
  purposeContext: 'PURPOSE::neutral/AR-005',
  retryContext: 'RETRY::neutral/AR-005',
} as const;

const supportPrivacyContext = {
  caseReference: 'CASE::neutral/AR-005',
  routeStatusEscalationIntent: 'STATUS::neutral/AR-005',
  minimumEvidenceReferences: ['EVIDENCE::neutral/AR-005'],
  reason: 'REASON::neutral/AR-005',
} as const;

describe('SCR-PUB-005 English and Arabic direction equivalence', () => {
  it('keeps equivalent handoff consequences while changing only direction', () => {
    const english = getApprovedNextStepHandoffViewModel(
      'en',
      'pending',
      [option],
      option.optionReference,
      visibility,
      externalContext,
      supportPrivacyContext,
    );
    const arabic = getApprovedNextStepHandoffViewModel(
      'ar',
      'pending',
      [option],
      option.optionReference,
      visibility,
      externalContext,
      supportPrivacyContext,
    );

    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.feedbackRole).toBe(english.feedbackRole);
    expect(arabic.feedbackTone).toBe(english.feedbackTone);
    expect(arabic.visibleIntents).toEqual(english.visibleIntents);
  });

  it('preserves option, correlation, case, and evidence references exactly in Arabic', () => {
    const viewModel = getApprovedNextStepHandoffViewModel(
      'ar',
      'ready',
      [option],
      option.optionReference,
      visibility,
      externalContext,
      supportPrivacyContext,
    );

    expect(viewModel.opaqueReferences.selectedOptionReference).toBe(option.optionReference);
    expect(viewModel.opaqueReferences.optionReferences).toEqual([option.optionReference]);
    expect(viewModel.opaqueReferences.correlationReference).toBe(
      externalContext.correlationReference,
    );
    expect(viewModel.opaqueReferences.caseReference).toBe(supportPrivacyContext.caseReference);
    expect(viewModel.opaqueReferences.minimumEvidenceReferences).toEqual(
      supportPrivacyContext.minimumEvidenceReferences,
    );
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
