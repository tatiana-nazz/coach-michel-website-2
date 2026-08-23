import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-004/programs-sessions-collection.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-004/programs-sessions-collection.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-004 programs and sessions collection accessibility contract', () => {
  it('uses one primary heading and complete collection-management regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="collection-navigation-context"');
    expect(component).toContain('data-region="programs-collection"');
    expect(component).toContain('data-region="sessions-collection"');
    expect(component).toContain('data-region="collection-consequence"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('labels controlled allowlisted filter and sort selectors with invalid-state feedback', () => {
    expect(component).toContain('htmlFor="programs-sessions-filter"');
    expect(component).toContain('htmlFor="programs-sessions-sort"');
    expect(component.match(/<select\b/g)).toHaveLength(2);
    expect(component.match(/aria-invalid=\{state === 'validation_error'\}/g)).toHaveLength(2);
    expect(component).toContain('aria-describedby="programs-sessions-feedback"');
    expect(component).not.toContain('type="text"');
  });

  it('retains ordered collections, busy state, and live feedback semantics', () => {
    expect(component.match(/<ol className=\{styles.collectionList\}>/g)).toHaveLength(2);
    expect(component).toContain('key={item.orderingReference}');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).toContain('data-consequence={viewModel.consequence}');
  });

  it('keeps controls touch-sized and visibly focused without navigation or transport', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
    expect(component).not.toContain('useRouter');
  });
});
