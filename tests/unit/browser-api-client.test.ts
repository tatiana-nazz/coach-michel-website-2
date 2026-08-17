import { describe, expect, it, vi } from 'vitest';

import { createBrowserApiClient } from '@/platform/api/browser-client';
import { ESTABLISH_SESSION_OPERATION_ID } from '@/platform/api/operations';

describe('P4-S08 browser API client', () => {
  it('submits only the governed request body to the same-origin operation', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ status: 'authenticated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createBrowserApiClient(fetchMock);

    await expect(
      client.execute({
        operationId: ESTABLISH_SESSION_OPERATION_ID,
        body: { email: 'trainee@example.com', password: 'secret' },
      }),
    ).resolves.toEqual({
      ok: true,
      data: { status: 'authenticated' },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/access/session');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('same-origin');
    expect(init?.cache).toBe('no-store');
    expect(init?.body).toBe(
      JSON.stringify({ email: 'trainee@example.com', password: 'secret' }),
    );
  });

  it('maps stable error codes without exposing a provider-specific response body', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'AUTHENTICATION_REQUIRED_OR_INVALID' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createBrowserApiClient(fetchMock);

    await expect(
      client.execute({
        operationId: ESTABLISH_SESSION_OPERATION_ID,
        body: { email: 'trainee@example.com', password: 'wrong' },
      }),
    ).resolves.toEqual({
      ok: false,
      error: {
        kind: 'unauthorized',
        status: 401,
        stableCode: 'AUTHENTICATION_REQUIRED_OR_INVALID',
      },
    });
  });
});
