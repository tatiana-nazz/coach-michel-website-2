import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/access/callback/route';
import { POST } from '@/app/access/password/update/route';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
vi.mock('@/platform/auth/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));
const factory = vi.mocked(createSupabaseServerClient);
beforeEach(() => factory.mockReset());
function passwordRequest(body: unknown, origin = 'https://cmh.example') {
  return new Request('https://cmh.example/access/password/update', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
describe('access callback and password boundary', () => {
  it('exchanges PKCE code and strips untrusted redirects', async () => {
    const exchange = vi.fn().mockResolvedValue({ data: { user: { id: 'a' } }, error: null });
    factory.mockResolvedValue({ auth: { exchangeCodeForSession: exchange } } as never);
    const result = await GET(
      new Request('https://cmh.example/access/callback?code=pkce&next=https://evil.example'),
    );
    expect(exchange).toHaveBeenCalledWith('pkce');
    expect(result.headers.get('location')).toBe('https://cmh.example/workspace');
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('verifies recovery token hashes and routes to password setup', async () => {
    const verify = vi.fn().mockResolvedValue({ data: { user: { id: 'a' } }, error: null });
    factory.mockResolvedValue({ auth: { verifyOtp: verify } } as never);
    const result = await GET(
      new Request('https://cmh.example/access/callback?token_hash=secret-hash&type=recovery'),
    );
    expect(verify).toHaveBeenCalledWith({ token_hash: 'secret-hash', type: 'recovery' });
    expect(result.headers.get('location')).toBe('https://cmh.example/access/password');
  });
  it('does not accept public signup confirmation or reflect provider errors', async () => {
    const verify = vi.fn();
    factory.mockResolvedValue({ auth: { verifyOtp: verify } } as never);
    const result = await GET(
      new Request(
        'https://cmh.example/access/callback?token_hash=value&type=signup&error_description=private',
      ),
    );
    expect(verify).not.toHaveBeenCalled();
    expect(result.headers.get('location')).toBe('https://cmh.example/access/error');
  });
  it('rejects expired exchanges without exposing secrets', async () => {
    factory.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: { message: 'private' } }),
      },
    } as never);
    const result = await GET(new Request('https://cmh.example/access/callback?code=expired'));
    expect(result.headers.get('location')).toBe('https://cmh.example/access/error');
  });
  it('rejects cross-site, short or authority-bearing password input before provider access', async () => {
    expect(
      (await POST(passwordRequest({ password: 'long-enough-passphrase' }, 'https://evil.example')))
        .status,
    ).toBe(400);
    expect((await POST(passwordRequest({ password: 'short' }))).status).toBe(400);
    expect(
      (await POST(passwordRequest({ password: 'long-enough-passphrase', userId: 'victim' })))
        .status,
    ).toBe(400);
    expect(factory).not.toHaveBeenCalled();
  });
  it('requires a server-validated authenticated user before changing a password', async () => {
    const update = vi.fn();
    factory.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        updateUser: update,
      },
    } as never);
    expect((await POST(passwordRequest({ password: 'long-enough-passphrase' }))).status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });
  it('updates only the current authenticated user and confirms provider success', async () => {
    const update = vi.fn().mockResolvedValue({ data: { user: { id: 'a' } }, error: null });
    factory.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'a' } }, error: null }),
        updateUser: update,
      },
    } as never);
    const result = await POST(passwordRequest({ password: 'long-enough-passphrase' }));
    expect(update).toHaveBeenCalledWith({ password: 'long-enough-passphrase' });
    expect(await result.json()).toEqual({ status: 'updated' });
  });
});
