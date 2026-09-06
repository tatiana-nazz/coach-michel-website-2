import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import { accessError, accessJson, readSmallJson, record } from '@/platform/auth/request-boundary';

export async function POST(request: Request) {
  let body: Record<string, unknown> | null;
  try {
    body = record(await readSmallJson(request));
  } catch {
    return accessError('VALIDATION_FAILED', 400);
  }
  if (
    !body ||
    Object.keys(body).length !== 1 ||
    typeof body.password !== 'string' ||
    body.password.length < 12 ||
    body.password.length > 128
  )
    return accessError('VALIDATION_FAILED', 400);
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user || data.user.is_anonymous)
      return accessError('AUTHENTICATION_REQUIRED_OR_INVALID', 401);
    const result = await client.auth.updateUser({ password: body.password });
    if (result.error) {
      if (result.error.status === 429) return accessError('RATE_LIMITED', 429);
      if (result.error.status !== undefined && result.error.status >= 500)
        return accessError('DEPENDENCY_UNAVAILABLE', 503);
      return accessError('VALIDATION_FAILED', 400);
    }
    if (!result.data.user) return accessError('DEPENDENCY_UNAVAILABLE', 503);
    return accessJson({ status: 'updated' });
  } catch {
    return accessError('DEPENDENCY_UNAVAILABLE', 503);
  }
}
