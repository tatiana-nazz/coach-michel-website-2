export type ApiFailureKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unknown';

export type StableApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'AUTHENTICATION_REQUIRED_OR_INVALID'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'AUTHORITY_DENIED'
  | 'RESOURCE_NOT_FOUND_OR_UNAVAILABLE'
  | 'STALE_OR_CONFLICTING_STATE';

export interface ApiFailure {
  readonly kind: ApiFailureKind;
  readonly status?: number;
  readonly stableCode?: StableApiErrorCode;
  readonly correlationId?: string;
  readonly cause?: unknown;
}

export type ApiResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: ApiFailure };

export interface ApiRequest<TBody = unknown> {
  readonly operationId: string;
  readonly body?: TBody;
  readonly signal?: AbortSignal;
}

export interface ApiClient {
  execute<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResult<TResponse>>;
}
