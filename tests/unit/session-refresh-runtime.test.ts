import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from '@/platform/auth/update-session';
vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn() }));
const factory = vi.mocked(createServerClient);
beforeEach(() => {
  factory.mockReset();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'publishable-test-key');
});
afterEach(() => vi.unstubAllEnvs());
describe('SSR session refresh', () => {
  it('forwards refreshed cookies to both server request and browser response', async () => {
    const getUser = vi.fn();
    factory.mockImplementation((_url, _key, options) => {
      getUser.mockImplementation(async () => {
        await options.cookies.setAll?.(
          [
            {
              name: 'sb-example-auth-token',
              value: 'fresh-token',
              options: { path: '/', httpOnly: true },
            },
          ],
          { 'Cache-Control': 'private, no-store', Expires: '0', Pragma: 'no-cache' },
        );
        return { data: { user: { id: 'verified-user' } }, error: null };
      });
      return { auth: { getUser } } as never;
    });
    const request = new NextRequest('https://cmh.example/workspace', {
      headers: { cookie: 'sb-example-auth-token=old-token' },
    });
    const result = await updateSession(request);
    expect(getUser).toHaveBeenCalledOnce();
    expect(result.user?.id).toBe('verified-user');
    expect(request.cookies.get('sb-example-auth-token')?.value).toBe('fresh-token');
    expect(result.response.cookies.get('sb-example-auth-token')?.value).toBe('fresh-token');
    expect(result.response.headers.get('cache-control')).toBe('private, no-store');
    expect(result.response.headers.get('expires')).toBe('0');
  });
  it('does not trust a returned user when Auth reports a validation error', async () => {
    factory.mockReturnValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: 'untrusted' } }, error: { status: 401 } }),
      },
    } as never);
    const result = await updateSession(new NextRequest('https://cmh.example/workspace'));
    expect(result.user).toBeNull();
    expect(result.available).toBe(true);
  });
  it('reports missing configuration and provider failure without a proxy crash', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect((await updateSession(new NextRequest('https://cmh.example/workspace'))).available).toBe(
      false,
    );
    expect(factory).not.toHaveBeenCalled();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'invalid-url');
    factory.mockImplementation(() => {
      throw new Error('Invalid provider URL');
    });
    const result = await updateSession(new NextRequest('https://cmh.example/workspace'));
    expect(result.available).toBe(false);
    expect(result.user).toBeNull();
  });
});
