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

export interface ApiFailure {
  readonly kind: ApiFailureKind;
  readonly status?: number;
  readonly correlationId?: string;
  readonly cause?: unknown;
}

export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiFailure };

export interface ApiRequest<TBody = unknown> {
  readonly operationId: string;
  readonly body?: TBody;
  readonly signal?: AbortSignal;
}

export interface ApiClient {
  execute<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResult<TResponse>>;
}
