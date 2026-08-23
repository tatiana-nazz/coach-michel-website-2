import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-001/incident-intake.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/operations/screens/scr-ops-001/incident-intake.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-OPS-001 incident intake accessibility contract', () => {
  it('uses one primary heading and the governed LA-009 semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    for (const region of [
      'context-identity',
      'authority-lifecycle',
      'system-state-resumption',
      'primary-task-information',
      'progress-sequence',
      'evidence-audit-context',
      'governed-actions',
      'validation-feedback',
      'help-recovery-external-handoff',
    ]) {
      expect(component).toContain(`data-region="${region}"`);
    }
  });

  it('keeps caller order and exposes a labelled controlled category selection', () => {
    expect(component).toContain('key={category.orderingReference}');
    expect(component).toContain('htmlFor="incident-intake-category"');
    expect(component).toContain("aria-invalid={state === 'validation_error'}");
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
  });

  it('announces feedback and keeps touch-sized focus without free text, uploads, or links', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('<form');
    expect(component).not.toContain('<textarea');
    expect(component).not.toContain('type="file"');
    expect(component).not.toContain('href=');
  });
});
