import type {
  ApiClient,
  ApiFailure,
  ApiFailureKind,
  ApiRequest,
  ApiResult,
  StableApiErrorCode,
} from './client';
import { operationRegistry, type ApiOperationMethod } from './operations';

const stableErrorCodes = new Set<StableApiErrorCode>([
  'VALIDATION_FAILED',
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
  'AUTHORITY_DENIED',
  'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
  'STALE_OR_CONFLICTING_STATE',
]);

function isStableApiErrorCode(value: unknown): value is StableApiErrorCode {
  return typeof value === 'string' && stableErrorCodes.has(value as StableApiErrorCode);
}

function stableCodeFromPayload(payload: unknown): StableApiErrorCode | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  if ('code' in payload && isStableApiErrorCode(payload.code)) {
    return payload.code;
  }

  if ('error' in payload && typeof payload.error === 'object' && payload.error !== null) {
    const error = payload.error;
    if ('code' in error && isStableApiErrorCode(error.code)) {
      return error.code;
    }
  }

  return undefined;
}

function failureKindForStatus(status: number, stableCode?: StableApiErrorCode): ApiFailureKind {
  if (stableCode === 'VALIDATION_FAILED') return 'validation';
  if (stableCode === 'AUTHENTICATION_REQUIRED_OR_INVALID') return 'unauthorized';
  if (stableCode === 'AUTHORITY_DENIED') return 'forbidden';
  if (stableCode === 'RESOURCE_NOT_FOUND_OR_UNAVAILABLE') return 'not-found';
  if (stableCode === 'STALE_OR_CONFLICTING_STATE') return 'conflict';

  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  if (status === 409) return 'conflict';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500) return 'server';

  return 'unknown';
}

async function parseJsonIfPresent(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function buildRequestInit<TBody>(
  method: ApiOperationMethod,
  request: ApiRequest<TBody>,
): RequestInit {
  const headers = new Headers({ Accept: 'application/json' });
  const init: RequestInit = {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers,
  };

  if (request.signal !== undefined) {
    init.signal = request.signal;
  }

  if (request.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    init.body = JSON.stringify(request.body);
  }

  return init;
}

export function createBrowserApiClient(fetchImpl: typeof fetch = fetch): ApiClient {
  return {
    async execute<TResponse, TBody = unknown>(
      request: ApiRequest<TBody>,
    ): Promise<ApiResult<TResponse>> {
      const operation = operationRegistry.get(request.operationId);
      if (operation?.method === undefined || operation.path === undefined) {
        return {
          ok: false,
          error: {
            kind: 'unknown',
            cause: new Error(`Unregistered API operation: ${request.operationId}`),
          },
        };
      }

      let response: Response;
      try {
        response = await fetchImpl(operation.path, buildRequestInit(operation.method, request));
      } catch (cause) {
        return {
          ok: false,
          error: {
            kind:
              cause instanceof DOMException && cause.name === 'AbortError' ? 'timeout' : 'network',
            cause,
          },
        };
      }

      const payload = await parseJsonIfPresent(response);
      if (response.ok) {
        return { ok: true, data: payload as TResponse };
      }

      const stableCode = stableCodeFromPayload(payload);
      const error: ApiFailure = {
        kind: failureKindForStatus(response.status, stableCode),
        status: response.status,
        ...(stableCode === undefined ? {} : { stableCode }),
      };

      return { ok: false, error };
    },
  };
}

export const browserApiClient = createBrowserApiClient();
