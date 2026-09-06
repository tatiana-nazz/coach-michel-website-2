import {
  isOpaqueReference,
  validateOperationsPayload,
} from '@/features/operations/runtime/contracts';
import type {
  EvidenceSummary,
  IncidentSummary,
  RecoverySummary,
  SupportCaseSummary,
  ValidationSummary,
} from '@/features/operations/runtime/contracts';
import { apiError, apiSuccess, authorizeOperation, executeCommand } from './boundary';
import type { ApiOperationContext } from './contracts';

const operationIds = new Set([
  'p3s11_apin_019_post_1',
  'p3s11_apin_038_collection',
  'p3s11_apin_038_detail',
  'p3s11_apin_039_patch_1',
  'p3s11_apin_040_intake',
  'p3s11_apin_040_collection',
  'p3s11_apin_040_detail',
  'p3s11_apin_041_post_1',
  'p3s11_apin_042_read_validation_context',
  'p3s11_apin_042_submit_validation',
  'p3s11_apin_043_post_1',
  'p3s11_apin_044_get_1',
  'p3s11_apin_048_get_1',
]);
const incidentFields =
  'id,incident_ref,classification_ref,affected_references,status,evidence,created_at';
const recoveryFields =
  'id,recovery_activity_ref,operational_incident_id,initiated_by_principal_id,status,activity_intent,evidence,started_at';
const validationFields = 'validation_ref,result,evidence,validated_at';
const supportFields = 'case_ref,request_category,minimum_routing_facts,status,created_at';

function object(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
function references(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isOpaqueReference) : [];
}
function evidence(value: unknown): EvidenceSummary {
  const data = object(value);
  return { summary: str(data.summary), references: references(data.references) };
}
export function toIncident(value: unknown): IncidentSummary {
  const row = object(value);
  return {
    incidentRef: str(row.incident_ref),
    classificationRef: str(row.classification_ref),
    affectedReferences: references(row.affected_references),
    status: str(row.status),
    evidence: evidence(row.evidence),
    createdAt: str(row.created_at),
  };
}
export function toRecovery(value: unknown): RecoverySummary {
  const row = object(value);
  const intent = object(row.activity_intent);
  return {
    recoveryActivityRef: str(row.recovery_activity_ref),
    status: str(row.status),
    category: str(intent.category),
    reason: str(intent.reason),
    evidence: evidence(row.evidence),
    startedAt: str(row.started_at),
  };
}
export function toValidation(value: unknown): ValidationSummary {
  const row = object(value);
  return {
    validationRef: str(row.validation_ref),
    result: str(row.result),
    evidence: evidence(row.evidence),
    validatedAt: str(row.validated_at),
  };
}
function toSupport(value: unknown): SupportCaseSummary {
  const row = object(value);
  return {
    caseRef: str(row.case_ref),
    requestCategory: str(row.request_category),
    message: str(object(row.minimum_routing_facts).message),
    status: str(row.status),
    createdAt: str(row.created_at),
  };
}

export function operationsListOptions(
  request: Request,
): { limit: number; offset: number; status?: string } | null {
  const query = new URL(request.url).searchParams;
  if (Array.from(query.keys()).some((key) => !['limit', 'offset', 'status'].includes(key)))
    return null;
  const limit = Number(query.get('limit') ?? '50');
  const offset = Number(query.get('offset') ?? '0');
  const status = query.get('status');
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 10000
  )
    return null;
  if (status !== null && !/^[A-Z_]{1,60}$/u.test(status)) return null;
  return { limit, offset, ...(status === null ? {} : { status }) };
}

export async function dispatchOperationsOperation(
  ctx: ApiOperationContext,
): Promise<Response | null> {
  if (!operationIds.has(ctx.operationId)) return null;
  const denied = await authorizeOperation(ctx);
  if (denied) return denied;

  const mutation = [
    'p3s11_apin_019_post_1',
    'p3s11_apin_039_patch_1',
    'p3s11_apin_040_intake',
    'p3s11_apin_041_post_1',
    'p3s11_apin_042_submit_validation',
    'p3s11_apin_043_post_1',
  ].includes(ctx.operationId);
  if (mutation) {
    const payload = validateOperationsPayload(ctx.operationId, ctx.body);
    if (!payload) return apiError('VALIDATION_FAILED', 422);
    const pathFields: Record<string, [string, string]> = {
      p3s11_apin_039_patch_1: ['case_ref', 'caseRef'],
      p3s11_apin_041_post_1: ['incident_ref', 'incidentRef'],
      p3s11_apin_042_submit_validation: ['recovery_activity_ref', 'recoveryActivityRef'],
      p3s11_apin_043_post_1: ['validation_ref', 'validationRef'],
    };
    const field = pathFields[ctx.operationId];
    if (field) {
      const value = ctx.params?.[field[0]];
      if (!isOpaqueReference(value)) return apiError('VALIDATION_FAILED', 422);
      return executeCommand(ctx, { ...payload, [field[1]]: value });
    }
    return executeCommand(ctx, payload);
  }

  if (
    ctx.operationId === 'p3s11_apin_040_collection' ||
    ctx.operationId === 'p3s11_apin_038_collection'
  ) {
    const options = operationsListOptions(ctx.request);
    if (!options) return apiError('VALIDATION_FAILED', 422);
    const support = ctx.operationId === 'p3s11_apin_038_collection';
    let query = ctx.supabase
      .from(support ? 'support_privacy_cases' : 'operational_incidents')
      .select(support ? supportFields : incidentFields)
      .order('created_at', { ascending: false })
      .range(options.offset, options.offset + options.limit);
    if (options.status) query = query.eq('status', options.status);
    const { data, error } = await query;
    if (error) return apiError('DEPENDENCY_UNAVAILABLE', 503);
    const rows = data ?? [];
    return apiSuccess({
      items: rows
        .slice(0, options.limit)
        .map((row) => (support ? toSupport(row) : toIncident(row))),
      nextOffset: rows.length > options.limit ? options.offset + options.limit : null,
    });
  }

  if (ctx.operationId === 'p3s11_apin_038_detail') {
    const ref = ctx.params?.case_ref;
    if (!isOpaqueReference(ref)) return apiError('VALIDATION_FAILED', 422);
    const { data, error } = await ctx.supabase
      .from('support_privacy_cases')
      .select(supportFields)
      .eq('case_ref', ref)
      .maybeSingle();
    if (error) return apiError('DEPENDENCY_UNAVAILABLE', 503);
    return data
      ? apiSuccess({ case: toSupport(data) })
      : apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  }

  if (ctx.operationId === 'p3s11_apin_040_detail') {
    const ref = ctx.params?.incident_ref;
    if (!isOpaqueReference(ref)) return apiError('VALIDATION_FAILED', 422);
    const { data, error } = await ctx.supabase
      .from('operational_incidents')
      .select(incidentFields)
      .eq('incident_ref', ref)
      .maybeSingle();
    if (error) return apiError('DEPENDENCY_UNAVAILABLE', 503);
    if (!data) return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
    const activities = await ctx.supabase
      .from('recovery_activities')
      .select(recoveryFields)
      .eq('operational_incident_id', data.id)
      .order('started_at', { ascending: false })
      .limit(100);
    if (activities.error) return apiError('DEPENDENCY_UNAVAILABLE', 503);
    return apiSuccess({
      incident: toIncident(data),
      activities: (activities.data ?? []).map(toRecovery),
    });
  }

  if (ctx.operationId === 'p3s11_apin_042_read_validation_context') {
    const ref = ctx.params?.recovery_activity_ref;
    if (!isOpaqueReference(ref)) return apiError('VALIDATION_FAILED', 422);
    const { data, error } = await ctx.supabase
      .from('recovery_activities')
      .select(recoveryFields)
      .eq('recovery_activity_ref', ref)
      .maybeSingle();
    if (error) return apiError('DEPENDENCY_UNAVAILABLE', 503);
    if (!data) return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
    const [validations, incident, principal] = await Promise.all([
      ctx.supabase
        .from('recovery_validations')
        .select(validationFields)
        .eq('recovery_activity_id', data.id)
        .order('validated_at', { ascending: false })
        .limit(100),
      ctx.supabase
        .from('operational_incidents')
        .select('incident_ref')
        .eq('id', data.operational_incident_id)
        .maybeSingle(),
      ctx.supabase
        .from('app_principals')
        .select('id')
        .eq('auth_user_id', ctx.user!.id)
        .eq('status', 'ACTIVE')
        .maybeSingle(),
    ]);
    if (validations.error || incident.error || principal.error)
      return apiError('DEPENDENCY_UNAVAILABLE', 503);
    return apiSuccess({
      activity: toRecovery(data),
      incidentRef: incident.data?.incident_ref ?? '',
      canValidate: Boolean(
        principal.data &&
        principal.data.id !== data.initiated_by_principal_id &&
        (validations.data?.length ?? 0) === 0,
      ),
      validations: (validations.data ?? []).map(toValidation),
    });
  }

  if (ctx.operationId === 'p3s11_apin_044_get_1') {
    const query = new URL(ctx.request.url).searchParams;
    if (Array.from(query.keys()).some((key) => !['limit', 'objectRef'].includes(key)))
      return apiError('VALIDATION_FAILED', 422);
    const limit = Number(query.get('limit') ?? '50');
    const objectRef = query.get('objectRef');
    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      (objectRef !== null && !isOpaqueReference(objectRef))
    )
      return apiError('VALIDATION_FAILED', 422);
    let events = ctx.supabase
      .from('audit_events')
      .select('event_ref,action,category,object_references,result,reason,occurred_at')
      .order('occurred_at', { ascending: false })
      .limit(limit);
    if (objectRef) events = events.contains('object_references', [objectRef]);
    const { data, error } = await events;
    if (error) return apiError('DEPENDENCY_UNAVAILABLE', 503);
    return apiSuccess({
      items: (data ?? []).map((row) => ({
        eventRef: row.event_ref,
        action: row.action,
        category: row.category,
        objectReferences: references(row.object_references),
        result: row.result,
        reason: row.reason,
        occurredAt: row.occurred_at,
      })),
    });
  }

  // A live query proves database reachability only, not whole-system recovery or deployment readiness.
  const { error } = await ctx.supabase
    .from('app_principals')
    .select('principal_ref')
    .eq('auth_user_id', ctx.user!.id)
    .limit(1);
  if (error) return apiError('DEPENDENCY_UNAVAILABLE', 503);
  return apiSuccess({
    checkedAt: new Date().toISOString(),
    dependencies: [{ name: 'database', status: 'REACHABLE' }],
    recoveryValidation: 'REQUIRES_INDEPENDENT_EVIDENCE',
  });
}
