import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-004/exercise-guidance-item.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-004/exercise-guidance-item.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
describe('SCR-TRN-004 exercise guidance item accessibility contract', () => {
  it('uses one primary heading and governed instruction/media regions', () => {
    expect(component.match(/<h1\b/g)).toHaveLength(1);
    for (const region of [
      'context-identity',
      'authority-lifecycle',
      'progress-sequence',
      'primary-task',
      'rights-cleared-media',
      'outcome-consequence',
      'external-handoff',
      'governed-actions',
      'validation-feedback',
      'help-recovery',
    ])
      expect(component).toContain(`data-region="${region}"`);
  });
  it('uses ordered instructions and labelled caller-rendered media figures', () => {
    expect(component).toContain('<ol');
    expect(component).toContain('<figure');
    expect(component).toContain('aria-labelledby={captionId}');
    expect(component).toContain('aria-label={media.accessibleLabel}');
    expect(component).toContain('renderRightsClearedMedia?.(media)');
    expect(component).toContain('<figcaption');
  });
  it('announces caller state and preserves focus without selecting a media URL', () => {
    expect(component).toContain('role={viewModel.feedbackRole}');
    expect(component).toContain("aria-busy={state === 'loading' || state === 'pending'}");
    expect(styles).toContain('min-block-size: 48px;');
    expect(styles).toContain(':focus-visible');
    expect(component).not.toContain('src=');
    expect(component).not.toContain('href=');
  });
});
