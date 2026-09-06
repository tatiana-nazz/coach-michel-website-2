import { readTraineeWorkspace } from '@/features/trainee/runtime/data';
import { loadCoachData } from '@/features/coach/runtime/data';
import { readAccessContext } from '@/platform/auth/access-context';
import type { CoachSection } from '@/features/coach/runtime/types';
import type { ApiOperationContext } from './contracts';
import { apiError, apiSuccess, databaseError, executeCommand } from './boundary';
import { trainingCommandIds, trainingCommandPayload } from './training-payload';

const coachReads: Record<string, CoachSection> = {
  p3s11_apin_020_get_1: 'overview',
  p3s11_apin_021_get_1: 'trainees',
  p3s11_apin_022_get_1: 'trainee',
  p3s11_apin_023_program_collection: 'programs',
  p3s11_apin_023_session_collection: 'programs',
  p3s11_apin_024_program_draft: 'programs',
  p3s11_apin_024_session_draft: 'prepare',
  p3s11_apin_026_get_1: 'exercises',
  p3s11_apin_031_get_1: 'completions',
  p3s11_apin_033_read_case: 'reconciliation',
  p3s11_apin_036_get_1: 'admin',
};
const traineeReads = new Set([
  'p3s11_apin_012_get_1',
  'p3s11_apin_013_get_1',
  'p3s11_apin_014_get_1',
  'p3s11_apin_015_get_1',
  'p3s11_apin_017_get_1',
  'p3s11_apin_018_get_1',
]);

export async function dispatchTrainingOperation(
  ctx: ApiOperationContext,
): Promise<Response | null> {
  if (trainingCommandIds.has(ctx.operationId)) {
    const payload = trainingCommandPayload(ctx.operationId, ctx.body, ctx.params);
    return payload ? executeCommand(ctx, payload) : apiError('VALIDATION_FAILED', 400);
  }
  const url = new URL(ctx.request.url);
  const locale = url.searchParams.get('locale') === 'ar' ? 'ar' : 'en';
  if (
    url.searchParams.has('locale') &&
    !['en', 'ar'].includes(url.searchParams.get('locale') ?? '')
  )
    return apiError('VALIDATION_FAILED', 400);
  const coachSection = coachReads[ctx.operationId];
  if (coachSection) {
    const reference =
      ctx.params?.trainee_ref ?? ctx.params?.session_ref ?? ctx.params?.case_ref ?? '';
    const data = await loadCoachData(ctx.supabase, coachSection, locale, reference);
    if (data.primary.error || data.secondary.error || data.tertiary.error)
      return apiError('DEPENDENCY_UNAVAILABLE', 503);
    if (ctx.operationId === 'p3s11_apin_023_program_collection') return apiSuccess(data.primary);
    if (ctx.operationId === 'p3s11_apin_023_session_collection') return apiSuccess(data.secondary);
    if (ctx.operationId === 'p3s11_apin_024_program_draft') {
      const item = data.primary.items.find((item) => item.ref === ctx.params?.program_ref);
      return item ? apiSuccess(item) : apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
    }
    if (
      ['p3s11_apin_022_get_1', 'p3s11_apin_024_session_draft', 'p3s11_apin_033_read_case'].includes(
        ctx.operationId,
      ) &&
      data.primary.items.length === 0
    )
      return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
    return apiSuccess(data);
  }
  if (!traineeReads.has(ctx.operationId)) return null;
  const context = await readAccessContext(ctx.supabase, ctx.user);
  if (context.status !== 'ready')
    return apiError(
      context.status === 'unavailable' ? 'DEPENDENCY_UNAVAILABLE' : 'AUTHORITY_DENIED',
      context.status === 'unavailable' ? 503 : 403,
    );
  if (ctx.operationId === 'p3s11_apin_018_get_1') {
    const result = await ctx.supabase
      .from('account_preferences')
      .select('locale,updated_at')
      .eq('principal_id', context.principal.id)
      .maybeSingle();
    if (result.error) return databaseError(result.error);
    return apiSuccess({
      principalRef: context.principal.principal_ref,
      roles: context.roleIds,
      locale: result.data?.locale ?? locale,
    });
  }
  if (ctx.operationId === 'p3s11_apin_017_get_1' && !context.roleIds.includes('ROL-003')) {
    const ref = ctx.params?.schedule_completion_or_case_ref ?? '';
    const result = await ctx.supabase
      .from('workout_completions')
      .select(
        'completion_ref,completion_state,authoritative_version,completed_at,session_schedules(schedule_ref)',
      )
      .eq('completion_ref', ref)
      .maybeSingle();
    if (result.error) return databaseError(result.error);
    return result.data
      ? apiSuccess({ status: 'CONFIRMED', completion: result.data })
      : apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  }
  const data = await readTraineeWorkspace(ctx.supabase, context.principal.id, locale);
  if (ctx.operationId === 'p3s11_apin_012_get_1') return apiSuccess(data);
  if (ctx.operationId === 'p3s11_apin_013_get_1') {
    const sessions = data.sessions.filter(
      (session) => session.sessionRef === ctx.params?.session_ref,
    );
    return sessions.length
      ? apiSuccess({ sessions })
      : apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  }
  if (ctx.operationId === 'p3s11_apin_017_get_1') {
    const ref = ctx.params?.schedule_completion_or_case_ref;
    const session = data.sessions.find(
      (session) =>
        session.scheduleRef === ref || session.completionRef === ref || session.intentRef === ref,
    );
    if (!session) return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
    const completion = data.completions.find(
      (completion) => completion.ref === session.completionRef,
    );
    return apiSuccess({
      scheduleRef: session.scheduleRef,
      status: completion ? 'CONFIRMED' : (session.intentStatus ?? 'NOT_SUBMITTED'),
      completion: completion ?? null,
      intentRef: session.intentRef,
    });
  }
  const session = data.sessions.find(
    (session) => session.scheduleRef === ctx.params?.session_schedule_ref,
  );
  if (!session || !session.released) return apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  if (ctx.operationId === 'p3s11_apin_014_get_1')
    return apiSuccess({ scheduleRef: session.scheduleRef, exercises: session.exercises });
  const exerciseRef = url.searchParams.get('exercise_ref');
  if (!exerciseRef) return apiError('VALIDATION_FAILED', 400);
  const exercise = session.exercises.find((exercise) => exercise.ref === exerciseRef);
  return exercise?.available
    ? apiSuccess(exercise)
    : apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
}
