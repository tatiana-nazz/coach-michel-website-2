import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-002/trainees-collection.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-002/trainees-collection.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-002 trainees collection accessibility contract', () => {
  it('uses one primary heading and collection-specific governed regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="collection-navigation-context"');
    expect(component).toContain('data-region="bounded-collection"');
    expect(component).toContain('data-region="collection-consequence"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('labels all allowlisted controlled selectors and invalid state', () => {
    expect(component).toContain('htmlFor="trainees-collection-search"');
    expect(component).toContain('htmlFor="trainees-collection-filter"');
    expect(component).toContain('htmlFor="trainees-collection-sort"');
    expect(component.match(/<select\b/g)).toHaveLength(3);
    expect(component.match(/aria-invalid=\{state === 'validation_error'\}/g)).toHaveLength(3);
    expect(component).toContain('aria-describedby="trainees-collection-feedback"');
  });

  it('uses stable ordered collection markup and live status semantics', () => {
    expect(component).toContain('<ol className={styles.collectionList}>');
    expect(component).toContain('key={trainee.orderingReference}');
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(component).not.toContain('type="text"');
  });

  it('retains touch-sized controls and visible focus without navigation or transport', () => {
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
    expect(component).not.toContain('useRouter');
  });
});
