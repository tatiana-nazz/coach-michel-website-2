import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import { matchOperation } from '@/platform/api/route-matcher';
import { apiError, authorizeOperation, isSameOrigin, readBoundedJson } from './boundary';
import { dispatchPublicOperation } from './public-operations';
import { dispatchAccessOperation } from './access-operations';
import { dispatchTrainingOperation } from './training-operations';
import { dispatchOperationsOperation } from './operations-operations';
import type { ApiOperationContext } from './contracts';

export async function dispatchApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/api\/operations(?=\/)/, '');
  const match = matchOperation(request.method, pathname);
  if (!match) return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  let body: Record<string, unknown> | undefined;
  if (request.method !== 'GET') {
    if (!isSameOrigin(request)) return apiError('VALIDATION_FAILED', 400);
    try {
      body = await readBoundedJson(request);
    } catch {
      return apiError('VALIDATION_FAILED', 400);
    }
  }
  try {
    const supabase = await createSupabaseServerClient();
    const auth = await supabase.auth.getUser();
    if (
      auth.error &&
      ![400, 401].includes(auth.error.status ?? 0) &&
      auth.error.name !== 'AuthSessionMissingError'
    )
      return apiError('DEPENDENCY_UNAVAILABLE', 503);
    const ctx: ApiOperationContext = {
      operationId: match.operation.operationId,
      request,
      supabase,
      user: auth.data.user,
      params: match.params,
      ...(body === undefined ? {} : { body }),
    };
    // Ops also uses its dispatcher from Server Components, so owns its entry guard.
    const ops = await dispatchOperationsOperation(ctx);
    if (ops) return ops;
    const denied = await authorizeOperation(ctx);
    if (denied) return denied;
    for (const dispatch of [
      dispatchPublicOperation,
      dispatchAccessOperation,
      dispatchTrainingOperation,
    ]) {
      const response = await dispatch(ctx);
      if (response) return response;
    }
    return apiError('DEPENDENCY_UNAVAILABLE', 503);
  } catch {
    return apiError('DEPENDENCY_UNAVAILABLE', 503);
  }
}
