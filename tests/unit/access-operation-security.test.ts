import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { dispatchAccessOperation } from '@/platform/server/access-operations';
import { readAccessContext } from '@/platform/auth/access-context';
vi.mock('@/platform/auth/access-context', () => ({
  readAccessContext: vi.fn(),
  readEffectiveNotices: vi.fn(),
}));
const readContext = vi.mocked(readAccessContext);
function context(operationId: string, body: unknown, client: unknown) {
  return {
    operationId,
    body,
    request: new Request('https://cmh.example/access/recovery-requests', {
      method: 'POST',
      headers: { Origin: 'https://cmh.example', 'Content-Type': 'application/json' },
    }),
    supabase: client as SupabaseClient,
    user: null,
  };
}
beforeEach(() => {
  vi.unstubAllEnvs();
  readContext.mockReset();
});
describe('access operation security', () => {
  it('does not reveal whether an email is known, suppressed, or throttled', async () => {
    const bodies = [];
    for (const error of [
      null,
      { status: 400, code: 'user_not_found' },
      { status: 429, code: 'over_email_send_rate_limit' },
    ]) {
      const resetPasswordForEmail = vi.fn().mockResolvedValue({ error });
      const from = vi.fn();
      const result = await dispatchAccessOperation(
        context(
          'p3s11_apin_010_post_1',
          { email: 'member@example.org' },
          { auth: { resetPasswordForEmail }, from },
        ),
      );
      expect(result?.status).toBe(202);
      bodies.push(await result?.json());
      expect(from).not.toHaveBeenCalled();
      expect(resetPasswordForEmail).toHaveBeenCalledWith('member@example.org', {
        redirectTo: 'https://cmh.example/access/callback?next=/access/password',
      });
    }
    expect(bodies[0]).toEqual(bodies[1]);
    expect(bodies[1]).toEqual(bodies[2]);
  });
  it('uses the trusted configured public origin through a reverse proxy', async () => {
    vi.stubEnv('CMH_APP_ORIGIN', 'https://cmh.example');
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });
    const ctx = context(
      'p3s11_apin_010_post_1',
      { email: 'member@example.org' },
      { auth: { resetPasswordForEmail } },
    );
    ctx.request = new Request('http://internal:3000/access/recovery-requests', {
      method: 'POST',
      headers: { Origin: 'https://cmh.example', 'Content-Type': 'application/json' },
    });
    expect((await dispatchAccessOperation(ctx))?.status).toBe(202);
    expect(resetPasswordForEmail).toHaveBeenCalledWith('member@example.org', {
      redirectTo: 'https://cmh.example/access/callback?next=/access/password',
    });
  });
  it('rejects identity/role injection and cross-site recovery submissions', async () => {
    const resetPasswordForEmail = vi.fn();
    expect(
      (
        await dispatchAccessOperation(
          context(
            'p3s11_apin_010_post_1',
            { email: 'member@example.org', roleId: 'ROL-005' },
            { auth: { resetPasswordForEmail } },
          ),
        )
      )?.status,
    ).toBe(400);
    const ctx = context(
      'p3s11_apin_010_post_1',
      { email: 'member@example.org' },
      { auth: { resetPasswordForEmail } },
    );
    ctx.request = new Request('https://cmh.example/access/recovery-requests', {
      method: 'POST',
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
    });
    expect((await dispatchAccessOperation(ctx))?.status).toBe(400);
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });
  it('does not claim delivery when the provider is unavailable', async () => {
    const result = await dispatchAccessOperation(
      context(
        'p3s11_apin_010_post_1',
        { email: 'member@example.org' },
        { auth: { resetPasswordForEmail: vi.fn().mockResolvedValue({ error: { status: 503 } }) } },
      ),
    );
    expect(result?.status).toBe(503);
    expect(await result?.json()).toEqual({ error: { code: 'DEPENDENCY_UNAVAILABLE' } });
  });
  it('binds acceptance to the current principal and sends only explicit decision data to the transaction', async () => {
    readContext.mockResolvedValue({
      status: 'ready',
      principal: { id: 'principal-a', principal_ref: 'member-a', status: 'ACTIVE' },
      roleIds: ['ROL-003'],
      grants: [],
    } as never);
    const rpc = vi
      .fn()
      .mockResolvedValue({ data: { decision: 'ACCEPTED', status: 'RECORDED' }, error: null });
    const result = await dispatchAccessOperation(
      context(
        'p3s11_apin_009_post_1',
        {
          disclosureVersionReference: 'terms-v1',
          response: 'accept',
          principalReference: 'member-a',
        },
        { rpc },
      ),
    );
    expect(result?.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('cmh_command', {
      p_operation: 'p3s11_apin_009_post_1',
      p_payload: { disclosureVersionReference: 'terms-v1', response: 'accept' },
    });
    rpc.mockClear();
    const denied = await dispatchAccessOperation(
      context(
        'p3s11_apin_009_post_1',
        {
          disclosureVersionReference: 'terms-v1',
          response: 'accept',
          principalReference: 'victim',
        },
        { rpc },
      ),
    );
    expect(denied?.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
});
