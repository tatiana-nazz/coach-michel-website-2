import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  getPublicDisclosuresViewModel,
  mapPublicDisclosuresErrorCode,
  publicDisclosuresStates,
} from '@/features/public/screens/scr-pub-004/public-disclosures.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-004/public-disclosures.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-PUB-004 public disclosures view model', () => {
  it('keeps the exact INFORMATION_READINESS states and governed failures distinct', () => {
    expect(publicDisclosuresStates).toEqual([
      'loading',
      'ready',
      'empty',
      'authentication_required',
      'authority_denied',
      'resource_not_found_or_unavailable',
      'dependency_unavailable',
      'rate_limited',
      'stale_or_conflicting_state',
      'recovery',
    ]);

    expect(mapPublicDisclosuresErrorCode('AUTHENTICATION_REQUIRED_OR_INVALID')).toBe(
      'authentication_required',
    );
    expect(mapPublicDisclosuresErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapPublicDisclosuresErrorCode('DEPENDENCY_UNAVAILABLE')).toBe('dependency_unavailable');
    expect(mapPublicDisclosuresErrorCode('RATE_LIMITED')).toBe('rate_limited');
    expect(mapPublicDisclosuresErrorCode('RESOURCE_NOT_FOUND_OR_UNAVAILABLE')).toBe(
      'resource_not_found_or_unavailable',
    );
    expect(mapPublicDisclosuresErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });

  it('uses the shared locale direction foundation for English and Arabic', () => {
    expect(getPublicDisclosuresViewModel('en', 'ready').direction).toBe('ltr');
    expect(getPublicDisclosuresViewModel('ar', 'ready').direction).toBe('rtl');
  });

  it('preserves caller-supplied evidence context without interpretation', () => {
    const evidenceContext = 'EVIDENCE::opaque/PUB-004';

    expect(
      getPublicDisclosuresViewModel('ar', 'ready', { evidenceContext }).opaqueReferences
        .evidenceContext,
    ).toBe(evidenceContext);
  });

  it('contains no effective-time, provider, acceptance, retention, or transport behavior', () => {
    expect(modelSource).not.toContain('Date.now');
    expect(modelSource).not.toContain('new Date');
    expect(modelSource).not.toContain('provider');
    expect(modelSource).not.toContain('retention');
    expect(modelSource).not.toContain('acceptance');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('operationRegistry');
  });
});
