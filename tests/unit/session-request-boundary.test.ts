import { beforeEach, describe, expect, it, vi } from 'vitest';
const { signIn, createClient } = vi.hoisted(() => ({ signIn: vi.fn(), createClient: vi.fn() }));
vi.mock('@/platform/auth/supabase-server', () => ({ createSupabaseServerClient: createClient }));
import { POST } from '@/app/access/session/route';

describe('browser credential request boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({ auth: { signInWithPassword: signIn } });
    signIn.mockResolvedValue({ data: { user: { id: 'fixture' } }, error: null });
  });
  function request(body: string, origin = 'https://coach.example') {
    return new Request('https://coach.example/access/session', {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json' },
      body,
    });
  }
  it('rejects cross-origin login before reaching the identity provider', async () => {
    const response = await POST(
      request(
        JSON.stringify({ email: 'member@example.com', password: 'fixture-only' }),
        'https://other.example',
      ),
    );
    expect(response.status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
  });
  it('rejects oversized bodies and malformed emails before reaching the provider', async () => {
    for (const body of [
      'x'.repeat(17_000),
      JSON.stringify({ email: 'not-an-email', password: 'fixture-only' }),
    ]) {
      expect((await POST(request(body))).status).toBe(400);
    }
    expect(createClient).not.toHaveBeenCalled();
  });
  it('allows valid same-origin credentials without caching or changing the password', async () => {
    const response = await POST(
      request(JSON.stringify({ email: 'member@example.com', password: '  fixture-only  ' })),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(signIn).toHaveBeenCalledWith({
      email: 'member@example.com',
      password: '  fixture-only  ',
    });
  });
});
