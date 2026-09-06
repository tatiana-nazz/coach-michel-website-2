import type { SupabaseClient, User } from '@supabase/supabase-js';
import { readAccessContext, readEffectiveNotices } from '@/platform/auth/access-context';
import { needsNoticeAcceptance, workspaceDestination } from '@/platform/auth/access-policy';
import {
  accessApplicationOrigin,
  accessError,
  accessJson,
  isSameOriginMutation,
  record,
} from '@/platform/auth/request-boundary';

export interface AccessOperationContext {
  operationId: string;
  request: Request;
  supabase: SupabaseClient;
  user: User | null;
  body?: unknown;
  params?: Record<string, string>;
}
const owned = new Set([
  'p3s11_apin_006_get_1',
  'p3s11_apin_007_get_1',
  'p3s11_apin_008_get_1',
  'p3s11_apin_009_post_1',
  'p3s11_apin_010_post_1',
  'p3s11_apin_011_get_1',
]);

export async function dispatchAccessOperation(
  ctx: AccessOperationContext,
): Promise<Response | null> {
  if (!owned.has(ctx.operationId)) return null;
  const { operationId, request, supabase, user } = ctx;
  try {
    if (operationId === 'p3s11_apin_010_post_1') {
      if (!isSameOriginMutation(request)) return accessError('VALIDATION_FAILED', 400);
      const body = record(ctx.body);
      if (
        !body ||
        Object.keys(body).some(
          (key) =>
            !['email', 'minimumRecoveryLocatorEvidence', 'requestedRecoveryPurpose'].includes(key),
        )
      )
        return accessError('VALIDATION_FAILED', 400);
      const email =
        typeof body.email === 'string'
          ? body.email.trim()
          : typeof body.minimumRecoveryLocatorEvidence === 'string'
            ? body.minimumRecoveryLocatorEvidence.trim()
            : '';
      if (
        !email ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        (body.requestedRecoveryPurpose !== undefined &&
          body.requestedRecoveryPurpose !== 'password_reset')
      )
        return accessError('VALIDATION_FAILED', 400);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: new URL(
          '/access/callback?next=/access/password',
          accessApplicationOrigin(request),
        ).toString(),
      });
      if (error && error.status !== undefined && error.status >= 500)
        return accessError('DEPENDENCY_UNAVAILABLE', 503);
      // Never expose unknown identity, recipient suppression, provider throttling, or account state.
      // This acknowledges the request; it does not claim that an email was delivered.
      return accessJson(
        {
          status: 'accepted',
          message: 'If an eligible account matches, recovery instructions will be sent.',
        },
        202,
      );
    }
    const context = await readAccessContext(supabase, user);
    if (context.status === 'anonymous')
      return accessError('AUTHENTICATION_REQUIRED_OR_INVALID', 401);
    if (context.status === 'unavailable') return accessError('DEPENDENCY_UNAVAILABLE', 503);
    if (context.status === 'forbidden') return accessError('AUTHORITY_DENIED', 403);
    const locale = new URL(request.url).searchParams.get('locale') === 'ar' ? 'ar' : 'en';
    if (operationId === 'p3s11_apin_006_get_1' || operationId === 'p3s11_apin_008_get_1') {
      const notices = await readEffectiveNotices(supabase, context.principal.id, locale);
      if (operationId === 'p3s11_apin_008_get_1') {
        if (!notices.available) return accessError('DEPENDENCY_UNAVAILABLE', 503);
        return accessJson({ notices: notices.notices, accepted: notices.accepted });
      }
      return accessJson({
        principalReference: context.principal.principal_ref,
        roleIds: context.roleIds,
        destination: workspaceDestination(context.roleIds),
        needsNoticeAcceptance: needsNoticeAcceptance(context.roleIds),
        noticesAvailable: notices.available,
        noticesAccepted: notices.accepted,
      });
    }
    if (operationId === 'p3s11_apin_009_post_1') {
      if (!isSameOriginMutation(request)) return accessError('VALIDATION_FAILED', 400);
      const body = record(ctx.body);
      if (
        !body ||
        Object.keys(body).some(
          (key) =>
            ![
              'disclosureVersionReference',
              'response',
              'principalReference',
              'evidenceContext',
            ].includes(key),
        ) ||
        typeof body.disclosureVersionReference !== 'string' ||
        body.disclosureVersionReference.length < 1 ||
        body.disclosureVersionReference.length > 200 ||
        !['accept', 'decline'].includes(String(body.response)) ||
        (body.principalReference !== undefined &&
          body.principalReference !== context.principal.principal_ref)
      )
        return accessError('VALIDATION_FAILED', 400);
      const { data, error } = await supabase.rpc('cmh_command', {
        p_operation: operationId,
        p_payload: {
          disclosureVersionReference: body.disclosureVersionReference,
          response: body.response,
        },
      });
      if (error) {
        if (error.code === '42501') return accessError('AUTHORITY_DENIED', 403);
        if (error.code === 'P0001' || error.code === '40001' || error.code === '23505')
          return accessError('STALE_OR_CONFLICTING_STATE', 409);
        return accessError('DEPENDENCY_UNAVAILABLE', 503);
      }
      if (data === null) return accessError('DEPENDENCY_UNAVAILABLE', 503);
      return accessJson(data, 200);
    }
    if (operationId === 'p3s11_apin_007_get_1') {
      const { data, error } = await supabase
        .from('access_provisioning_records')
        .select('provisioning_ref,status,expires_at,created_at')
        .eq('principal_id', context.principal.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return error
        ? accessError('DEPENDENCY_UNAVAILABLE', 503)
        : accessJson({ records: data ?? [] });
    }
    const ref = ctx.params?.recovery_ref;
    if (!ref || ref.length > 200) return accessError('VALIDATION_FAILED', 400);
    const { data, error } = await supabase
      .from('access_recovery_requests')
      .select('recovery_request_ref,status,created_at,updated_at')
      .eq('principal_id', context.principal.id)
      .eq('recovery_request_ref', ref)
      .maybeSingle();
    if (error) return accessError('DEPENDENCY_UNAVAILABLE', 503);
    return data ? accessJson(data) : accessError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  } catch {
    return accessError('DEPENDENCY_UNAVAILABLE', 503);
  }
}
