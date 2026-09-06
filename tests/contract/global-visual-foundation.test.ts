import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const tokens = readFileSync(
  fileURLToPath(new URL('../../src/design-system/tokens.css', import.meta.url)),
  'utf8',
);
const globals = readFileSync(
  fileURLToPath(new URL('../../src/app/globals.css', import.meta.url)),
  'utf8',
);

function readVariables(source: string): Readonly<Record<string, string>> {
  const variables: Record<string, string> = {};

  for (const match of source.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)) {
    const name = match[1];
    const value = match[2];

    if (name !== undefined && value !== undefined) {
      variables[name] = value.trim();
    }
  }

  return variables;
}

function rgbChannelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  expect(normalized).toMatch(/^[0-9a-f]{6}$/i);

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return (
    0.2126 * rgbChannelToLinear(red) +
    0.7152 * rgbChannelToLinear(green) +
    0.0722 * rgbChannelToLinear(blue)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('App Builder v1.2 global luminous visual foundation', () => {
  const variables = readVariables(tokens);

  it('binds the accepted mandatory color, glass, gradient, radius, spacing, and motion tokens', () => {
    expect(variables['--cmh-canvas']).toBe('#f7faff');
    expect(variables['--cmh-paper']).toBe('#ffffff');
    expect(variables['--cmh-surface-ice']).toBe('#f0f6ff');
    expect(variables['--cmh-ink-primary']).toBe('#071c3d');
    expect(variables['--cmh-ink-secondary']).toBe('#203a64');
    expect(variables['--cmh-ink-muted']).toBe('#4d6a94');
    expect(variables['--cmh-blue-core']).toBe('#075fea');
    expect(variables['--cmh-blue-strong']).toBe('#034fc7');
    expect(variables['--cmh-blue-cyan-decorative']).toBe('#4bc3ff');
    expect(variables['--cmh-blue-node']).toBe('#2f9cf4');
    expect(variables['--cmh-border-accessible']).toBe('#6e8cb5');
    expect(variables['--cmh-border-soft-decorative']).toBe('#bdd0ea');
    expect(variables['--cmh-navy-panel']).toBe('#071f49');
    expect(variables['--cmh-navy-panel-2']).toBe('#0a2a5c');
    expect(variables['--cmh-navy-text']).toBe('#ffffff');
    expect(variables['--cmh-navy-text-secondary']).toBe('#c8d9f4');

    expect(variables['--cmh-glass-soft']).toBe('rgba(255, 255, 255, 0.72)');
    expect(variables['--cmh-glass-standard']).toBe('rgba(255, 255, 255, 0.82)');
    expect(variables['--cmh-glass-strong']).toBe('rgba(255, 255, 255, 0.94)');
    expect(variables['--cmh-glass-dark']).toBe('rgba(7, 31, 73, 0.92)');
    expect(variables['--cmh-glass-blur-mobile']).toBe('12px');
    expect(variables['--cmh-glass-blur-desktop']).toBe('16px');

    expect(variables['--cmh-gradient-blue-action']).toBe(
      'linear-gradient(135deg, #075fea 0%, #0a83ff 100%)',
    );
    expect(variables['--cmh-radius-control']).toBe('16px');
    expect(variables['--cmh-radius-card']).toBe('20px');
    expect(variables['--cmh-radius-panel']).toBe('24px');
    expect(variables['--cmh-radius-hero']).toBe('28px');
    expect(variables['--cmh-radius-sheet']).toBe('28px');
    expect(variables['--cmh-radius-pill']).toBe('999px');

    expect(variables['--cmh-space-1']).toBe('4px');
    expect(variables['--cmh-space-24']).toBe('96px');
    expect(variables['--cmh-grid-desktop-max-content']).toBe('1280px');

    expect(variables['--cmh-motion-press']).toBe('90ms');
    expect(variables['--cmh-motion-route']).toBe('160ms');
    expect(variables['--cmh-motion-standard']).toBe('220ms');
    expect(variables['--cmh-motion-panel']).toBe('280ms');
    expect(variables['--cmh-motion-card-enter']).toBe('300ms');
    expect(variables['--cmh-motion-chart-draw']).toBe('600ms');
    expect(variables['--cmh-motion-hero-trails']).toBe('900ms');
    expect(variables['--cmh-motion-hero-total-budget']).toBe('1100ms');
    expect(variables['--cmh-motion-stagger']).toBe('40ms');
    expect(variables['--cmh-ease-standard']).toBe('cubic-bezier(0.2, 0.8, 0.2, 1)');
    expect(variables['--cmh-ease-emphasis']).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
  });

  it('provides exact focus, reduced-motion, and deterministic settled-motion foundations', () => {
    expect(tokens).toContain('color-scheme: light');
    expect(globals).toContain(':focus-visible');
    expect(globals).toContain('outline: 2px solid #034fc7');
    expect(globals).toContain('outline-offset: 2px');

    expect(globals).toContain('@media (prefers-reduced-motion: reduce)');
    expect(globals).toContain('animation-duration: 50ms !important');
    expect(globals).toContain('transition-duration: 50ms !important');
    expect(globals).toContain('transform: none !important');

    expect(globals).toContain("html[data-p5-motion='settled']");
    expect(globals).toContain('animation-duration: 0ms !important');
    expect(globals).toContain('transition-duration: 0ms !important');
  });

  it('meets every accepted contrast pair threshold', () => {
    const acceptedPairs = [
      ['--cmh-ink-primary', '--cmh-canvas', 4.5],
      ['--cmh-ink-secondary', '--cmh-canvas', 4.5],
      ['--cmh-ink-muted', '--cmh-canvas', 4.5],
      ['--cmh-blue-core', '--cmh-paper', 4.5],
      ['--cmh-paper', '--cmh-blue-core', 4.5],
      ['--cmh-blue-focus', '--cmh-paper', 3],
      ['--cmh-navy-text', '--cmh-navy-panel', 4.5],
      ['--cmh-navy-text-secondary', '--cmh-navy-panel', 4.5],
      ['--cmh-state-information', '--cmh-canvas', 4.5],
      ['--cmh-state-success', '--cmh-paper', 4.5],
      ['--cmh-state-warning', '--cmh-state-warning-surface', 4.5],
      ['--cmh-state-danger', '--cmh-paper', 4.5],
      ['--cmh-border-accessible', '--cmh-canvas', 3],
    ] as const;

    expect(acceptedPairs).toHaveLength(13);

    for (const [foregroundToken, backgroundToken, minimum] of acceptedPairs) {
      const foreground = variables[foregroundToken];
      const background = variables[backgroundToken];

      if (foreground === undefined || background === undefined) {
        throw new Error(`Missing accepted contrast token: ${foregroundToken}/${backgroundToken}`);
      }

      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(minimum);
    }
  });

  it('introduces no external font, network, or paid dependency reference in the foundation styles', () => {
    const foundation = `${tokens}\n${globals}`.toLowerCase();

    expect(foundation).not.toContain('@import');
    expect(foundation).not.toContain('url(http');
    expect(foundation).not.toContain('fonts.googleapis');
    expect(foundation).not.toContain('fonts.gstatic');
    expect(foundation).not.toContain('typekit');
    expect(foundation).not.toContain('font-face');
  });
});
