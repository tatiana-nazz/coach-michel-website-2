import { describe, expect, it, vi } from 'vitest';
import { buildOperationPath, createBrowserApiClient } from '@/platform/api/browser-client';

describe('API path binding', () => {
  it('keeps an opaque reference inside a single encoded segment and serializes filters', () => {
    expect(
      buildOperationPath('/public/guidance/{public_content_ref}', {
        pathParams: { public_content_ref: 'exercise/one?# العربية' },
        query: { page: 0, archived: false, search: 'a&b', skip: undefined },
      }),
    ).toBe(
      '/public/guidance/exercise%2Fone%3F%23%20%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9?page=0&archived=false&search=a%26b',
    );
  });
  it('rejects missing, extra and dot-segment parameters before fetching', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    const client = createBrowserApiClient(fetchMock);
    for (const pathParams of [
      {},
      { public_content_ref: '..' },
      { public_content_ref: 'ok', extra: 'no' },
    ]) {
      const result = await client.execute({ operationId: 'p3s11_apin_003_get_1', pathParams });
      expect(result).toEqual({
        ok: false,
        error: { kind: 'validation', stableCode: 'VALIDATION_FAILED' },
      });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('does not treat an HTML page returned by an API collision as success', async () => {
    const client = createBrowserApiClient(
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response('<html>not JSON</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
      ),
    );
    expect(await client.execute({ operationId: 'p3s11_apin_012_get_1' })).toEqual({
      ok: false,
      error: { kind: 'server', status: 200, stableCode: 'DEPENDENCY_UNAVAILABLE' },
    });
  });
});
