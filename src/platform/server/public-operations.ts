import type { ApiOperationContext } from './contracts';
import { apiError, apiSuccess, databaseError } from './boundary';
const publicKinds: Record<string, readonly string[]> = {
  p3s11_apin_001_get_1: ['PUBLIC_OVERVIEW'],
  p3s11_apin_002_get_1: ['PUBLIC_GUIDANCE'],
  p3s11_apin_003_get_1: ['PUBLIC_GUIDANCE'],
  p3s11_apin_005_get_1: ['PUBLIC_NEXT_STEP'],
};

export async function dispatchPublicOperation(ctx: ApiOperationContext): Promise<Response | null> {
  if (!publicKinds[ctx.operationId] && ctx.operationId !== 'p3s11_apin_004_get_1') return null;
  const url = new URL(ctx.request.url);
  const locale = url.searchParams.get('locale') ?? 'en';
  if (!['en', 'ar'].includes(locale)) return apiError('VALIDATION_FAILED', 400);
  const now = new Date().toISOString();
  if (ctx.operationId === 'p3s11_apin_004_get_1') {
    const { data, error } = await ctx.supabase
      .from('disclosure_versions')
      .select('version_ref,version_number,locale,body,effective_from,effective_until')
      .eq('status', 'PUBLISHED')
      .eq('locale', locale)
      .lte('effective_from', now)
      .or(`effective_until.is.null,effective_until.gt.${now}`)
      .order('version_number', { ascending: false })
      .limit(50);
    return error
      ? databaseError(error)
      : apiSuccess({ items: data ?? [], available: Boolean(data?.length) });
  }
  const kinds = publicKinds[ctx.operationId]!;
  const { data, error } = await ctx.supabase
    .from('content_versions')
    .select(
      'version_ref,version_number,locale,body,effective_from,effective_until,content_items!inner(content_ref,content_kind)',
    )
    .eq('status', 'PUBLISHED')
    .eq('locale', locale)
    .in('content_items.content_kind', kinds)
    .lte('effective_from', now)
    .or(`effective_until.is.null,effective_until.gt.${now}`)
    .order('version_number', { ascending: false })
    .limit(100);
  if (error) return databaseError(error);
  const entries = (data ?? []).map((item) => {
    const parent = Array.isArray(item.content_items) ? item.content_items[0] : item.content_items;
    return {
      contentRef: parent?.content_ref,
      versionRef: item.version_ref,
      locale: item.locale,
      body: item.body,
      effectiveFrom: item.effective_from,
    };
  });
  if (ctx.operationId === 'p3s11_apin_003_get_1') {
    const entry = entries.find((entry) => entry.contentRef === ctx.params?.public_content_ref);
    return entry ? apiSuccess(entry) : apiError('RESOURCE_NOT_FOUND_OR_UNAVAILABLE', 404);
  }
  const seen = new Set<string>();
  const items = entries.filter((entry) => {
    if (!entry.contentRef || seen.has(entry.contentRef)) return false;
    seen.add(entry.contentRef);
    return true;
  });
  return apiSuccess({ items, available: items.length > 0 });
}
