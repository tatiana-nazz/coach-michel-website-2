import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/coach/screens/scr-coa-001/coach-overview.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-001/coach-overview.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-001 coach overview accessibility contract', () => {
  it('uses one primary heading and deterministic governed semantic regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="collection-navigation-context"');
    expect(component).toContain('data-region="primary-task"');
    expect(component).toContain('data-region="supporting-detail"');
    expect(component).toContain('data-region="status-consequence"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
    expect(component).toContain('data-region="help-recovery"');
  });

  it('binds caller-controlled filters to a labelled group and validation feedback', () => {
    expect(component).toContain('<fieldset');
    expect(component).toContain('<legend>{copy.filtersLegend}</legend>');
    expect(component).toContain('type="checkbox"');
    expect(component).toContain(
      'checked={snapshot.selectedFilterReferences.includes(option.filterReference)}',
    );
    expect(component).toContain("aria-invalid={state === 'validation_error'}");
    expect(component).toContain('aria-describedby="coach-overview-feedback"');
  });

  it('announces explicit status/consequence state and keeps pending semantics distinct', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(component).toContain('data-consequence={viewModel.consequence}');
  });

  it('retains touch-sized controls and visible focus without navigation or transport', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
    expect(component).not.toContain('useRouter');
  });
});
