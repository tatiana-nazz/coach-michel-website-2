import { describe, expect, it, vi } from 'vitest';

import { SupabaseGrantAuthority } from '@/platform/authorization/supabase-grant-authority';

describe('P4-S06 application-owned Supabase grant authority', () => {
  it('passes governed capability, resource and opaque scopes unchanged to the database grant predicate', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const authority = new SupabaseGrantAuthority(() => Promise.resolve({ rpc }));

    await expect(
      authority.hasActiveGrant({
        capabilityId: 'CAP-007',
        resourceId: 'RES-006',
        objectRef: 'object/ref opaque',
        subjectRef: 'subject#opaque',
      }),
    ).resolves.toBe(true);

    expect(rpc).toHaveBeenCalledWith('has_active_grant', {
      requested_capability_id: 'CAP-007',
      requested_resource_id: 'RES-006',
      requested_object_ref: 'object/ref opaque',
      requested_subject_ref: 'subject#opaque',
    });
  });

  it('omits absent optional scopes so database defaults remain authoritative', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const authority = new SupabaseGrantAuthority(() => Promise.resolve({ rpc }));

    await expect(
      authority.hasActiveGrant({ capabilityId: 'CAP-003', resourceId: 'RES-004' }),
    ).resolves.toBe(true);

    expect(rpc).toHaveBeenCalledWith('has_active_grant', {
      requested_capability_id: 'CAP-003',
      requested_resource_id: 'RES-004',
    });
  });

  it.each([
    [{ data: false, error: null }, 'false result'],
    [{ data: null, error: null }, 'null result'],
    [{ data: true, error: new Error('provider failure') }, 'provider error'],
  ])('fails closed for %s', async (result) => {
    const authority = new SupabaseGrantAuthority(() =>
      Promise.resolve({ rpc: vi.fn().mockResolvedValue(result) }),
    );

    await expect(
      authority.hasActiveGrant({ capabilityId: 'CAP-019', resourceId: 'RES-018' }),
    ).resolves.toBe(false);
  });

  it('fails closed when client creation or RPC execution throws', async () => {
    const creationFailure = new SupabaseGrantAuthority(() => Promise.reject(new Error('offline')));
    const rpcFailure = new SupabaseGrantAuthority(() =>
      Promise.resolve({ rpc: vi.fn().mockRejectedValue(new Error('rpc offline')) }),
    );

    await expect(
      creationFailure.hasActiveGrant({ capabilityId: 'CAP-019', resourceId: 'RES-018' }),
    ).resolves.toBe(false);
    await expect(
      rpcFailure.hasActiveGrant({ capabilityId: 'CAP-019', resourceId: 'RES-018' }),
    ).resolves.toBe(false);
  });
});
