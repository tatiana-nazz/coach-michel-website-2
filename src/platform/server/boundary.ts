import { deliveryOperationAuthorities } from '@/platform/api/delivery-operations';
import type { StableApiErrorCode } from '@/platform/api/client';
import {
  operationAuthorityDefinitions,
  type GovernedProductionOperationId,
} from '@/platform/authorization/operation-authority';
import { readAccessContext, readEffectiveNotices } from '@/platform/auth/access-context';
import type { ApiOperationContext } from './contracts';

export function apiSuccess(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      Vary: 'Accept, Cookie',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export function apiError(code: StableApiErrorCode, status: number): Response {
  return apiSuccess({ error: { code } }, status);
}

const publicOperations = new Set([
  'p3s11_apin_001_get_1',
  'p3s11_apin_002_get_1',
  'p3s11_apin_003_get_1',
  'p3s11_apin_004_get_1',
  'p3s11_apin_005_get_1',
]);
const neutralOperations = new Set(['p3s11_apin_006_get_1', 'p3s11_apin_010_post_1']);

/** Coarse entry check only. Row policies and transactional commands enforce each resource scope. */
export async function authorizeOperation(ctx: ApiOperationContext): Promise<Response | null> {
  if (publicOperations.has(ctx.operationId) || neutralOperations.has(ctx.operationId)) return null;
  if (!ctx.user) return apiError('AUTHENTICATION_REQUIRED_OR_INVALID', 401);
  const context = await readAccessContext(ctx.supabase, ctx.user);
  if (context.status === 'unavailable') return apiError('DEPENDENCY_UNAVAILABLE', 503);
  if (context.status !== 'ready') return apiError('AUTHORITY_DENIED', 403);
  const definition =
    operationAuthorityDefinitions[ctx.operationId as GovernedProductionOperationId] ??
    deliveryOperationAuthorities[ctx.operationId];
  if (!definition) return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  const roles: readonly string[] = definition.roleIds;
  const capabilities: readonly string[] = definition.capabilityIds;
  const resources: readonly string[] = definition.resourceIds;
  if (
    !context.grants.some(
      (grant) =>
        roles.includes(grant.role_id) &&
        capabilities.includes(grant.capability_id) &&
        resources.includes(grant.resource_id),
    )
  ) {
    return apiError('AUTHORITY_DENIED', 403);
  }
  const trainingOperation = /^p3s11_apin_01[2-7]_/.test(ctx.operationId);
  if (
    trainingOperation &&
    context.roleIds.includes('ROL-003') &&
    !context.roleIds.some((role) =>
      [
        'ROL-004',
        'ROL-005',
        'ROL-006',
        'ROL-007',
        'ROL-008',
        'ROL-009',
        'ROL-010',
        'ROL-011',
      ].includes(role),
    )
  ) {
    const locale = new URL(ctx.request.url).searchParams.get('locale') === 'ar' ? 'ar' : 'en';
    const notices = await readEffectiveNotices(ctx.supabase, context.principal.id, locale);
    if (!notices.available) return apiError('DEPENDENCY_UNAVAILABLE', 503);
    if (!notices.accepted) return apiError('AUTHORITY_DENIED', 403);
  }
  return null;
}

export function databaseError(error: { code?: string; message?: string } | null): Response {
  const stable = error?.message;
  if (stable === 'AUTHORITY_DENIED' || error?.code === '42501')
    return apiError('AUTHORITY_DENIED', 403);
  if (stable === 'AUTHENTICATION_REQUIRED_OR_INVALID')
    return apiError('AUTHENTICATION_REQUIRED_OR_INVALID', 401);
  if (stable === 'RESOURCE_NOT_FOUND_OR_UNAVAILABLE' || error?.code === 'P0002')
    return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  if (stable === 'STALE_OR_CONFLICTING_STATE' || error?.code === '23505' || error?.code === '40001')
    return apiError('STALE_OR_CONFLICTING_STATE', 409);
  if (
    stable === 'VALIDATION_FAILED' ||
    error?.code?.startsWith('22') ||
    error?.code === '23514' ||
    error?.code === '23502'
  )
    return apiError('VALIDATION_FAILED', 400);
  return apiError('DEPENDENCY_UNAVAILABLE', 503);
}

export async function executeCommand(
  ctx: ApiOperationContext,
  payload: Record<string, unknown>,
): Promise<Response> {
  const { data, error } = await ctx.supabase.rpc('cmh_command', {
    p_operation: ctx.operationId,
    p_payload: payload,
  });
  if (error) return databaseError(error);
  if (data === null || typeof data !== 'object') return apiError('DEPENDENCY_UNAVAILABLE', 503);
  return apiSuccess(data);
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const expected = process.env.CMH_APP_ORIGIN ?? new URL(request.url).origin;
  return origin !== null && origin === expected;
}

export async function readBoundedJson(
  request: Request,
  maximumBytes = 65_536,
): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? ''))
    throw new Error('VALIDATION_FAILED');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('VALIDATION_FAILED');
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximumBytes) {
        await reader.cancel();
        throw new Error('VALIDATION_FAILED');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const payload: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error('VALIDATION_FAILED');
  return payload as Record<string, unknown>;
}
