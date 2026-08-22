import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-001/public-overview.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);

const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-001/public-overview.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-PUB-001 accessibility contract', () => {
  it('uses one deterministic primary heading and labels every governed semantic region', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    expect(component).toContain('aria-labelledby="public-overview-title"');
    expect(component).toContain('data-region="context-identity"');
    expect(component).toContain('data-region="primary-information"');
    expect(component).toContain('data-region="supporting-detail"');
    expect(component).toContain('data-region="disclosure-notice"');
    expect(component).toContain('data-region="help-recovery"');
    expect(component).toContain('data-region="system-feedback"');
  });

  it('applies language, direction and state feedback semantics consistently', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'");
  });

  it('communicates state with visible text and a decorative marker rather than color alone', () => {
    expect(component).toContain('<span>{copy.feedback[state]}</span>');
    expect(component).toContain('aria-hidden="true"');
    expect(component).toContain('data-feedback-tone={viewModel.feedbackTone}');
  });

  it('provides governed visible focus treatment if a focusable control is later supplied', () => {
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('outline: var(--cmh-focus-width) solid var(--cmh-blue-focus);');
    expect(styles).toContain('outline-offset: var(--cmh-focus-offset);');
  });

  it('remains a component-only surface with no navigation target', () => {
    expect(component).not.toContain('href=');
    expect(component).toContain("import type { SupportedLocale } from '@/i18n/config';");
    expect(component).toContain("from './public-overview.model';");
    expect(component).toContain("from './public-overview.module.css';");
  });
});
