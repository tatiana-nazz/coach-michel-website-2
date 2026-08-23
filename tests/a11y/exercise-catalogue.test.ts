import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL('../../src/features/coach/screens/scr-coa-006/exercise-catalogue.tsx', import.meta.url),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-006/exercise-catalogue.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-COA-006 exercise catalogue accessibility contract', () => {
  it('uses one primary heading and complete collection-management regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="authority-lifecycle"');
    expect(component).toContain('data-region="collection-navigation-context"');
    expect(component).toContain('data-region="bounded-collection"');
    expect(component).toContain('data-region="collection-consequence"');
    expect(component).toContain('data-region="governed-actions"');
    expect(component).toContain('data-region="validation-feedback"');
  });

  it('labels controlled approval and sort selectors with invalid-state feedback', () => {
    expect(component).toContain('htmlFor="exercise-catalogue-approval-filter"');
    expect(component).toContain('htmlFor="exercise-catalogue-sort"');
    expect(component.match(/<select\b/g)).toHaveLength(2);
    expect(component.match(/aria-invalid=\{state === 'validation_error'\}/g)).toHaveLength(2);
    expect(component).toContain('aria-describedby="exercise-catalogue-feedback"');
    expect(component).not.toContain('type="text"');
  });

  it('retains ordered catalogue and explicit safety, rights, complexity, language, and accessibility gates', () => {
    expect(component).toContain('<ol className={styles.catalogueList}>');
    expect(component).toContain('key={exercise.orderingReference}');
    expect(component).toContain('exercise.safetyStatusLabel');
    expect(component).toContain('exercise.rightsStatusLabel');
    expect(component).toContain('exercise.complexityStatusLabel');
    expect(component).toContain('exercise.languageStatusLabel');
    expect(component).toContain('exercise.accessibilityStatusLabel');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
  });

  it('announces feedback and keeps touch-sized focus without routes, transport, or publish forms', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('href=');
    expect(component).not.toContain('fetch(');
    expect(component).not.toContain('<form');
  });
});
