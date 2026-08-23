import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  getPublicCoachingPurposeViewModel,
  mapPublicCoachingPurposeErrorCode,
  publicCoachingPurposeStates,
} from '@/features/public/screens/scr-pub-002/public-coaching-purpose.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-002/public-coaching-purpose.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-PUB-002 public coaching purpose view model', () => {
  it('keeps the exact INFORMATION_READINESS states and governed failures distinct', () => {
    expect(publicCoachingPurposeStates).toEqual([
      'loading',
      'ready',
      'empty',
      'authority_denied',
      'resource_not_found_or_unavailable',
      'dependency_unavailable',
      'rate_limited',
      'stale_or_conflicting_state',
      'recovery',
    ]);

    expect(mapPublicCoachingPurposeErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapPublicCoachingPurposeErrorCode('DEPENDENCY_UNAVAILABLE')).toBe(
      'dependency_unavailable',
    );
    expect(mapPublicCoachingPurposeErrorCode('RATE_LIMITED')).toBe('rate_limited');
    expect(mapPublicCoachingPurposeErrorCode('RESOURCE_NOT_FOUND_OR_UNAVAILABLE')).toBe(
      'resource_not_found_or_unavailable',
    );
    expect(mapPublicCoachingPurposeErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });

  it('uses the shared locale direction foundation for English and Arabic', () => {
    expect(getPublicCoachingPurposeViewModel('en', 'ready').direction).toBe('ltr');
    expect(getPublicCoachingPurposeViewModel('ar', 'ready').direction).toBe('rtl');
  });

  it('preserves caller-supplied opaque content context without reinterpretation', () => {
    const approvedContentContext = 'CTX::opaque/PUB-002';

    expect(
      getPublicCoachingPurposeViewModel('ar', 'ready', { approvedContentContext })
        .opaqueReferences.approvedContentContext,
    ).toBe(approvedContentContext);
  });

  it('contains no transport, provider, or durable-success behavior', () => {
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('operationRegistry');
    expect(modelSource).not.toContain('Supabase');
    expect(modelSource).not.toContain('localStorage');
  });
});
