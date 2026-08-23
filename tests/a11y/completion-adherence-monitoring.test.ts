import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-008/completion-adherence-monitoring.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-008/completion-adherence-monitoring.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-008 completion monitoring accessibility contract', () => {
  it('uses one primary heading and complete monitoring/reconciliation regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="collection-navigation-context"');
    expect(component).toContain('data-region="monitoring-review"');
    expect(component).toContain('data-region="evidence-audit-context"');
    expect(component).toContain('data-region="outcome-consequence"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('labels controlled status and sort selectors and preserves ordered status context', () => {
    expect(component).toContain('htmlFor="completion-monitoring-status-filter"');
    expect(component).toContain('htmlFor="completion-monitoring-sort"');
    expect(component.match(/<select\b/g)).toHaveLength(2);
    expect(component.match(/aria-invalid=\{state === 'validation_error'\}/g)).toHaveLength(2);
    expect(component).toContain('<ol className={styles.itemList}>');
    expect(component).toContain('key={item.orderingReference}');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
  });

  it('announces feedback and keeps touch-sized focus without routes or transport', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
  });
});
