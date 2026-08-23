import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-009/correction-reconciliation-review.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-009/correction-reconciliation-review.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-009 correction and reconciliation accessibility contract', () => {
  it('uses one primary heading and complete conflict/reconciliation regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="conflict-reconciliation"');
    expect(component).toContain('data-region="evidence-audit-context"');
    expect(component).toContain('data-region="outcome-consequence"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('retains ordered cases, explicit statuses, busy state, and labelled action context', () => {
    expect(component).toContain('<ol className={styles.itemList}>');
    expect(component).toContain('key={item.orderingReference}');
    expect(component).toContain('item.proposalStatusLabel');
    expect(component).toContain('item.decisionStatusLabel');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(component).toContain('aria-labelledby="correction-reconciliation-cases-heading"');
  });

  it('announces feedback and keeps touch-sized focus without upload, forms, routes, or transport', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('<form');
    expect(component).not.toContain('type="file"');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
  });
});
