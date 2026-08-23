import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-002/available-session-overview.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-002/available-session-overview.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
describe('SCR-TRN-002 available session overview accessibility contract', () => {
  it('uses one primary heading and labelled status, collection, action, feedback, and recovery regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    for (const region of [
      'context-identity',
      'authority-lifecycle',
      'status-summary',
      'collection-navigation',
      'outcome-consequence',
      'governed-actions',
      'validation-feedback',
      'help-recovery',
    ])
      expect(component).toContain(`data-region="${region}"`);
  });
  it('uses a controlled labelled radio group with visible descriptions', () => {
    expect(component).toContain('<fieldset');
    expect(component).toContain('type="radio"');
    expect(component).toContain('checked={selectedWorkReference === item.workReference}');
    expect(component).toContain('aria-describedby={`${descriptionId} available-session-feedback`}');
  });
  it('announces state and retains visible focus without route selection', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('href=');
  });
});
