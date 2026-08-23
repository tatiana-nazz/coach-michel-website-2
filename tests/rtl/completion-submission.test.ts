import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getCompletionSubmissionViewModel } from '@/features/trainee/screens/scr-trn-005/completion-submission.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-005/completion-submission.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-005/completion-submission.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const context = {
  scheduleReference: 'SCHEDULE::neutral/AR-005',
  businessIntentReference: 'INTENT::neutral/AR-005',
  clientEvidenceReferences: ['EVIDENCE::neutral/AR-005'],
} as const;
const visibility = {
  submit_completion_intent: true,
  retry: false,
  reconcile_existing_completion: false,
} as const;

describe('SCR-TRN-005 English and Arabic direction equivalence', () => {
  it('changes direction without changing pending consequence', () => {
    const en = getCompletionSubmissionViewModel('en', 'pending', context, visibility);
    const ar = getCompletionSubmissionViewModel('ar', 'pending', context, visibility);
    expect(en.direction).toBe('ltr');
    expect(ar.direction).toBe('rtl');
    expect(ar.state).toBe(en.state);
    expect(ar.feedbackRole).toBe(en.feedbackRole);
    expect(ar.feedbackTone).toBe(en.feedbackTone);
    expect(ar.durableFinal).toBe(false);
  });

  it('preserves opaque completion-intent references exactly', () => {
    const model = getCompletionSubmissionViewModel('ar', 'ready', context, visibility);
    expect(model.opaqueReferences.scheduleReference).toBe(context.scheduleReference);
    expect(model.opaqueReferences.businessIntentReference).toBe(context.businessIntentReference);
    expect(model.opaqueReferences.clientEvidenceReferences).toEqual(
      context.clientEvidenceReferences,
    );
  });

  it('uses shared direction and logical CSS without direction-specific ordering', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(styles).toContain('margin-inline:');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
