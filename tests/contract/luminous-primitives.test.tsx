import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  ActionButton,
  GlassCard,
  StatusChip,
  actionButtonVariants,
  glassCardVariants,
  statusChipVariants,
  type StatusChipProps,
} from '@/design-system/components';

const css = readFileSync(
  fileURLToPath(
    new URL('../../src/design-system/components/luminous-primitives.module.css', import.meta.url),
  ),
  'utf8',
);

describe('App Builder v1.2 luminous core primitive contract', () => {
  it('exports the exact governed variant names', () => {
    expect(glassCardVariants).toEqual(['soft', 'standard', 'strong', 'dark']);
    expect(actionButtonVariants).toEqual([
      'primary_glow',
      'secondary_outline',
      'ghost',
      'danger',
    ]);
    expect(statusChipVariants).toEqual(['info', 'success', 'warning', 'danger', 'neutral']);
  });

  it('renders GlassCard only as an allowed semantic container', () => {
    for (const variant of glassCardVariants) {
      const defaultMarkup = renderToStaticMarkup(
        <GlassCard variant={variant}>Content</GlassCard>,
      );
      expect(defaultMarkup).toContain('<div');
      expect(defaultMarkup).toContain(`data-glass-card-variant="${variant}"`);
      expect(defaultMarkup).toContain('Content');
    }

    expect(renderToStaticMarkup(<GlassCard as="section">Section</GlassCard>)).toContain('<section');
    expect(renderToStaticMarkup(<GlassCard as="article">Article</GlassCard>)).toContain('<article');
  });

  it('renders ActionButton with native button, disabled and loading accessibility semantics', () => {
    for (const variant of actionButtonVariants) {
      const markup = renderToStaticMarkup(
        <ActionButton variant={variant}>Continue</ActionButton>,
      );
      expect(markup).toContain('<button');
      expect(markup).toContain('type="button"');
      expect(markup).toContain(`data-action-button-variant="${variant}"`);
      expect(markup).toContain('Continue');
    }

    const disabled = renderToStaticMarkup(<ActionButton disabled>Disabled</ActionButton>);
    expect(disabled).toContain('disabled=""');

    const loading = renderToStaticMarkup(<ActionButton loading>Loading</ActionButton>);
    expect(loading).toContain('disabled=""');
    expect(loading).toContain('aria-busy="true"');
  });

  it('requires StatusChip visible text at the type and runtime boundary', () => {
    expectTypeOf<StatusChipProps['children']>().toEqualTypeOf<string>();

    expect(() => renderToStaticMarkup(<StatusChip>{''}</StatusChip>)).toThrowError(
      'StatusChip requires visible text.',
    );
    expect(() => renderToStaticMarkup(<StatusChip>{'   '}</StatusChip>)).toThrowError(
      'StatusChip requires visible text.',
    );
  });

  it('renders StatusChip variants with unchanged visible text and an aria-hidden marker', () => {
    for (const variant of statusChipVariants) {
      const suppliedText = '  Visible status  ';
      const markup = renderToStaticMarkup(
        <StatusChip variant={variant}>{suppliedText}</StatusChip>,
      );
      expect(markup).toContain(`data-status-chip-variant="${variant}"`);
      expect(markup).toContain(`>${suppliedText}</span>`);
      expect(markup).toContain('aria-hidden="true"');
      expect(markup).not.toContain('role=');
      expect(markup).not.toContain('aria-live=');
    }
  });

  it('uses only accepted luminous tokens and no external CSS import or URL', () => {
    expect(css).toContain('var(--cmh-glass-standard)');
    expect(css).toContain('var(--cmh-radius-card)');
    expect(css).toContain('var(--cmh-radius-control)');
    expect(css).toContain('var(--cmh-border-accessible)');
    expect(css).toContain('var(--cmh-shadow-button-glow)');
    expect(css).toContain('var(--cmh-motion-press)');
    expect(css).toContain('var(--cmh-state-danger)');
    expect(css).not.toMatch(/@import/i);
    expect(css).not.toMatch(/url\s*\(/i);
  });
});
