import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/access/session/route';
import { ESTABLISH_SESSION_OPERATION_ID, operationRegistry } from '@/platform/api/operations';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';

vi.mock('@/platform/auth/supabase-server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

const route = readFileSync(
  fileURLToPath(new URL('../../src/app/access/session/route.ts', import.meta.url)),
  'utf8',
);

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);

function credentialRequest(body: string): Request {
  return new Request('http://localhost/access/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

function mockSignInResult(result: {
  readonly data: { readonly user: { readonly id: string } | null };
  readonly error: { readonly status?: number; readonly code?: string } | null;
}) {
  const signInWithPassword = vi.fn().mockResolvedValue(result);
  createSupabaseServerClientMock.mockResolvedValue({
    auth: { signInWithPassword },
  } as never);
  return signInWithPassword;
}

beforeEach(() => {
  createSupabaseServerClientMock.mockReset();
});

describe('P4-S08 SCR-ACC-001 session contract', () => {
  it('binds the governed operation id, method, path, and P3-S11 artifact', () => {
    expect(ESTABLISH_SESSION_OPERATION_ID).toBe('p3s11_scr_acc_001_establish_session_1');
    expect(operationRegistry.get(ESTABLISH_SESSION_OPERATION_ID)).toEqual({
      operationId: ESTABLISH_SESSION_OPERATION_ID,
      contractReference: 'ART-CMH-P3-S11-RL4382-SUPABASE-CREDENTIAL-SUBMISSION-REV4384-001',
      method: 'POST',
      path: '/access/session',
    });
  });

  it('delegates credential verification to Supabase Auth through the SSR server client', () => {
    expect(route).toContain('createSupabaseServerClient');
    expect(route).toContain('supabase.auth.signInWithPassword');
    expect(route).toContain('email: parsed.value.email');
    expect(route).toContain('password: parsed.value.password');
  });

  it('returns only the governed authenticated success body with non-cacheable semantics', () => {
    expect(route).toContain("{ status: 'authenticated' }");
    expect(route).toContain("'Cache-Control': 'private, no-store'");
    expect(route).not.toContain('accessToken');
    expect(route).not.toContain('refreshToken');
    expect(route).not.toContain('roleIds');
    expect(route).not.toContain('subjectId');
  });

  it('rejects malformed or authority-bearing input before provider access', async () => {
    const malformedResponse = await POST(credentialRequest('{'));

    expect(malformedResponse.status).toBe(400);
    expect(malformedResponse.headers.get('cache-control')).toBe('private, no-store');
    await expect(malformedResponse.json()).resolves.toEqual({
      error: { code: 'VALIDATION_FAILED' },
    });

    const authorityBearingResponse = await POST(
      credentialRequest(
        JSON.stringify({
          email: 'trainee@example.com',
          password: 'exact-secret',
          subjectId: 'client-asserted',
        }),
      ),
    );

    expect(authorityBearingResponse.status).toBe(400);
    expect(authorityBearingResponse.headers.get('cache-control')).toBe('private, no-store');
    await expect(authorityBearingResponse.json()).resolves.toEqual({
      error: { code: 'VALIDATION_FAILED' },
    });
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it.each([
    [
      { status: 401, code: 'invalid_credentials' },
      401,
      'AUTHENTICATION_REQUIRED_OR_INVALID',
    ],
    [{ status: 429 }, 429, 'RATE_LIMITED'],
    [{ status: 500 }, 503, 'DEPENDENCY_UNAVAILABLE'],
  ] as const)(
    'maps provider failure %o to governed HTTP %i / %s',
    async (providerError, expectedStatus, expectedCode) => {
      mockSignInResult({
        data: { user: null },
        error: providerError,
      });

      const response = await POST(
        credentialRequest(
          JSON.stringify({
            email: 'trainee@example.com',
            password: 'exact-secret',
          }),
        ),
      );

      expect(response.status).toBe(expectedStatus);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      await expect(response.json()).resolves.toEqual({
        error: { code: expectedCode },
      });
    },
  );

  it('returns only the governed authenticated envelope after accepted credentials', async () => {
    const signInWithPassword = mockSignInResult({
      data: { user: { id: 'provider-subject' } },
      error: null,
    });

    const response = await POST(
      credentialRequest(
        JSON.stringify({
          email: 'trainee@example.com',
          password: 'exact-secret',
        }),
      ),
    );

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'trainee@example.com',
      password: 'exact-secret',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    await expect(response.json()).resolves.toEqual({ status: 'authenticated' });
  });

  it(
    'fails closed when provider success lacks a user or the provider client is unavailable',
    async () => {
      mockSignInResult({
        data: { user: null },
        error: null,
      });

      const missingUserResponse = await POST(
        credentialRequest(
          JSON.stringify({
            email: 'trainee@example.com',
            password: 'exact-secret',
          }),
        ),
      );

      expect(missingUserResponse.status).toBe(503);
      expect(missingUserResponse.headers.get('cache-control')).toBe('private, no-store');
      await expect(missingUserResponse.json()).resolves.toEqual({
        error: { code: 'DEPENDENCY_UNAVAILABLE' },
      });

      createSupabaseServerClientMock.mockRejectedValueOnce(new Error('provider unavailable'));

      const unavailableResponse = await POST(
        credentialRequest(
          JSON.stringify({
            email: 'trainee@example.com',
            password: 'exact-secret',
          }),
        ),
      );

      expect(unavailableResponse.status).toBe(503);
      expect(unavailableResponse.headers.get('cache-control')).toBe('private, no-store');
      await expect(unavailableResponse.json()).resolves.toEqual({
        error: { code: 'DEPENDENCY_UNAVAILABLE' },
      });
    },
  );
});
