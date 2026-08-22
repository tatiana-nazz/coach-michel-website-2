import { describe, expect, it } from 'vitest';

import {
  getPublicOverviewViewModel,
  mapPublicOverviewErrorCode,
  publicOverviewStates,
} from '@/features/public/screens/scr-pub-001/public-overview.model';

describe('SCR-PUB-001 public overview view model', () => {
  it('keeps the exact relevant INFORMATION_READINESS states distinct', () => {
    expect(publicOverviewStates).toEqual([
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
    expect(publicOverviewStates).not.toContain('authentication_required');
  });

  it('maps the five governed public-read error codes without collapsing semantics', () => {
    expect(mapPublicOverviewErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapPublicOverviewErrorCode('DEPENDENCY_UNAVAILABLE')).toBe('dependency_unavailable');
    expect(mapPublicOverviewErrorCode('RATE_LIMITED')).toBe('rate_limited');
    expect(mapPublicOverviewErrorCode('RESOURCE_NOT_FOUND_OR_UNAVAILABLE')).toBe(
      'resource_not_found_or_unavailable',
    );
    expect(mapPublicOverviewErrorCode('STALE_OR_CONFLICTING_STATE')).toBe(
      'stale_or_conflicting_state',
    );
  });

  it('uses the preserved locale direction helper for English and Arabic', () => {
    expect(getPublicOverviewViewModel('en', 'ready').direction).toBe('ltr');
    expect(getPublicOverviewViewModel('ar', 'ready').direction).toBe('rtl');
  });

  it('preserves opaque approved-content context and references without reinterpretation', () => {
    const opaque = {
      approvedContentContext: 'CTX::Public/Alpha-01',
      reference: 'REF-opaque_7F9',
    };

    const viewModel = getPublicOverviewViewModel('ar', 'ready', opaque);

    expect(viewModel.opaqueReferences.approvedContentContext).toBe(opaque.approvedContentContext);
    expect(viewModel.opaqueReferences.reference).toBe(opaque.reference);
  });

  it('uses status semantics for readiness and alert semantics for governed failures', () => {
    expect(getPublicOverviewViewModel('en', 'loading').feedbackRole).toBe('status');
    expect(getPublicOverviewViewModel('en', 'ready').feedbackRole).toBe('status');
    expect(getPublicOverviewViewModel('en', 'empty').feedbackRole).toBe('status');
    expect(getPublicOverviewViewModel('en', 'recovery').feedbackRole).toBe('status');
    expect(getPublicOverviewViewModel('en', 'authority_denied').feedbackRole).toBe('alert');
    expect(getPublicOverviewViewModel('en', 'dependency_unavailable').feedbackRole).toBe('alert');
    expect(getPublicOverviewViewModel('en', 'rate_limited').feedbackRole).toBe('alert');
    expect(
      getPublicOverviewViewModel('en', 'resource_not_found_or_unavailable').feedbackRole,
    ).toBe('alert');
    expect(getPublicOverviewViewModel('en', 'stale_or_conflicting_state').feedbackRole).toBe(
      'alert',
    );
  });
});
