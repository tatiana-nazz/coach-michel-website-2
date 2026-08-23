import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  getPublicGuidanceCollectionViewModel,
  mapPublicGuidanceCollectionErrorCode,
  publicGuidanceCollectionStates,
} from '@/features/public/screens/scr-pub-003/public-guidance-collection.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/public/screens/scr-pub-003/public-guidance-collection.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('SCR-PUB-003 public guidance collection view model', () => {
  it('keeps the exact INFORMATION_READINESS states and governed failures distinct', () => {
    expect(publicGuidanceCollectionStates).toEqual([
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

    expect(mapPublicGuidanceCollectionErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapPublicGuidanceCollectionErrorCode('DEPENDENCY_UNAVAILABLE')).toBe(
      'dependency_unavailable',
    );
    expect(mapPublicGuidanceCollectionErrorCode('RATE_LIMITED')).toBe('rate_limited');
    expect(mapPublicGuidanceCollectionErrorCode('RESOURCE_NOT_FOUND_OR_UNAVAILABLE')).toBe(
      'resource_not_found_or_unavailable',
    );
    expect(mapPublicGuidanceCollectionErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });

  it('uses the shared locale direction foundation for English and Arabic', () => {
    expect(getPublicGuidanceCollectionViewModel('en', 'ready').direction).toBe('ltr');
    expect(getPublicGuidanceCollectionViewModel('ar', 'ready').direction).toBe('rtl');
  });

  it('preserves caller-supplied collection order and opaque references', () => {
    const content = {
      approvedContentContext: 'CTX::opaque/PUB-003',
      items: [
        { heading: 'A', body: 'A body', reference: 'REF::A' },
        { heading: 'B', body: 'B body', reference: 'REF::B' },
      ],
    } as const;

    const viewModel = getPublicGuidanceCollectionViewModel('ar', 'ready', content);

    expect(viewModel.showCollection).toBe(true);
    expect(viewModel.opaqueReferences.approvedContentContext).toBe(content.approvedContentContext);
    expect(viewModel.opaqueReferences.itemReferences).toEqual(['REF::A', 'REF::B']);
  });

  it('does not invent filtering, sorting, pagination, navigation, or transport behavior', () => {
    expect(modelSource).not.toContain('.sort(');
    expect(modelSource).not.toContain('filter(');
    expect(modelSource).not.toContain('pagination');
    expect(modelSource).not.toContain('continuation');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('operationRegistry');
  });
});
