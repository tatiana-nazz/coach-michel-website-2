import type { SupabaseClient, User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { websiteLocale } from '@/features/website/locale';
import { createSupabaseServerClient } from './supabase-server';
import { activeGrants, needsNoticeAcceptance, type ActiveGrant } from './access-policy';

export { hasWorkspaceGrant, workspaceDestination } from './access-policy';
export type { ActiveGrant } from './access-policy';

export interface WorkspacePrincipal {
  id: string;
  principal_ref: string;
  status: string;
}
export interface WorkspaceSession {
  supabase: SupabaseClient;
  user: User;
  principal: WorkspacePrincipal;
  grants: ActiveGrant[];
  roleIds: string[];
}
export type AccessContext =
  | { status: 'anonymous' }
  | { status: 'unavailable' }
  | { status: 'forbidden' }
  | ({ status: 'ready' } & WorkspaceSession);

export async function readAccessContext(
  supabase: SupabaseClient,
  user: User | null,
): Promise<AccessContext> {
  if (!user || user.is_anonymous) return { status: 'anonymous' };
  try {
    const { data: principal, error } = await supabase
      .from('app_principals')
      .select('id,principal_ref,status')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    if (error) return { status: 'unavailable' };
    if (!principal || principal.status !== 'ACTIVE') return { status: 'forbidden' };
    const { data: rows, error: grantError } = await supabase
      .from('principal_grants')
      .select(
        'role_id,capability_id,resource_id,object_ref,subject_ref,valid_from,valid_until,revoked_at',
      )
      .eq('principal_id', principal.id)
      .is('revoked_at', null);
    if (grantError) return { status: 'unavailable' };
    const grants = activeGrants((rows ?? []) as ActiveGrant[]);
    const roleIds = [...new Set(grants.map((grant) => grant.role_id))];
    if (roleIds.length === 0) return { status: 'forbidden' };
    return {
      status: 'ready',
      supabase,
      user,
      principal: principal as WorkspacePrincipal,
      grants,
      roleIds,
    };
  } catch {
    return { status: 'unavailable' };
  }
}

export interface EffectiveNotice {
  id: string;
  versionRef: string;
  locale: 'en' | 'ar';
  title: string;
  paragraphs: string[];
  decision: 'ACCEPTED' | 'DECLINED' | null;
  acceptedInLocale: 'en' | 'ar' | null;
}
interface NoticeRow {
  id: string;
  disclosure_document_id: string;
  version_ref: string;
  version_number: number;
  locale: 'en' | 'ar';
  body: unknown;
  effective_from: string | null;
  effective_until: string | null;
}
export function noticeText(body: unknown): { title: string; paragraphs: string[] } | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  const title =
    typeof value.title === 'string'
      ? value.title
      : typeof value.heading === 'string'
        ? value.heading
        : '';
  const text =
    typeof value.body === 'string'
      ? value.body
      : typeof value.text === 'string'
        ? value.text
        : typeof value.content === 'string'
          ? value.content
          : '';
  const paragraphs = Array.isArray(value.paragraphs)
    ? value.paragraphs.filter(
        (line): line is string => typeof line === 'string' && line.trim().length > 0,
      )
    : text.split(/\n\s*\n/).filter((line) => line.trim().length > 0);
  return title.trim() && paragraphs.length > 0 ? { title, paragraphs } : null;
}

export async function readEffectiveNotices(
  supabase: SupabaseClient,
  principalId: string,
  locale: 'en' | 'ar',
): Promise<{ available: boolean; notices: EffectiveNotice[]; accepted: boolean }> {
  try {
    const [versions, acceptances] = await Promise.all([
      supabase
        .from('disclosure_versions')
        .select(
          'id,disclosure_document_id,version_ref,version_number,locale,body,effective_from,effective_until',
        )
        .eq('status', 'PUBLISHED')
        .in('locale', ['en', 'ar']),
      supabase
        .from('acceptance_records')
        .select('acceptance_ref,disclosure_version_id,decision,decided_at')
        .eq('principal_id', principalId),
    ]);
    if (versions.error || acceptances.error)
      return { available: false, notices: [], accepted: false };
    const now = Date.now();
    const selected = new Map<string, NoticeRow>();
    const effectiveRows: NoticeRow[] = [];
    for (const row of (versions.data ?? []) as NoticeRow[]) {
      if (
        (row.effective_from !== null && Date.parse(row.effective_from) > now) ||
        (row.effective_until !== null && Date.parse(row.effective_until) <= now)
      )
        continue;
      effectiveRows.push(row);
      const prior = selected.get(row.disclosure_document_id);
      if (
        !prior ||
        row.version_number > prior.version_number ||
        (row.version_number === prior.version_number &&
          row.locale === locale &&
          prior.locale !== locale)
      )
        selected.set(row.disclosure_document_id, row);
    }
    const decisions = new Map(
      (acceptances.data ?? []).map((row) => [row.disclosure_version_id, row]),
    );
    const notices: EffectiveNotice[] = [];
    for (const row of selected.values()) {
      const text = noticeText(row.body);
      // A malformed/empty publication cannot be silently accepted or skipped.
      if (!text) return { available: false, notices: [], accepted: false };
      const decision = decisions.get(row.id)?.decision;
      const latestDecision = effectiveRows
        .filter(
          (candidate) =>
            candidate.disclosure_document_id === row.disclosure_document_id &&
            candidate.version_number === row.version_number &&
            decisions.has(candidate.id),
        )
        .map((candidate) => ({ locale: candidate.locale, record: decisions.get(candidate.id)! }))
        .sort((a, b) => {
          const timeOrder = Date.parse(b.record.decided_at) - Date.parse(a.record.decided_at);
          if (timeOrder !== 0) return timeOrder;
          return a.record.acceptance_ref === b.record.acceptance_ref
            ? 0
            : a.record.acceptance_ref > b.record.acceptance_ref
              ? -1
              : 1;
        })[0];
      notices.push({
        id: row.id,
        versionRef: row.version_ref,
        locale: row.locale,
        ...text,
        decision: decision === 'ACCEPTED' || decision === 'DECLINED' ? decision : null,
        acceptedInLocale:
          latestDecision?.record.decision === 'ACCEPTED' ? latestDecision.locale : null,
      });
    }
    return {
      available: notices.length > 0,
      notices,
      accepted: notices.length > 0 && notices.every((notice) => notice.acceptedInLocale !== null),
    };
  } catch {
    return { available: false, notices: [], accepted: false };
  }
}

export async function requireWorkspaceSession(
  options: { requireNotices?: boolean } = {},
): Promise<WorkspaceSession> {
  let supabase: SupabaseClient;
  let user: User | null;
  try {
    supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
    if (
      result.error &&
      result.error.status !== 400 &&
      result.error.status !== 401 &&
      result.error.name !== 'AuthSessionMissingError'
    )
      redirect('/workspace?state=unavailable');
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    redirect('/workspace?state=unavailable');
  }
  const context = await readAccessContext(supabase, user);
  if (context.status === 'anonymous') redirect('/access');
  if (context.status === 'forbidden') redirect('/workspace?state=forbidden');
  if (context.status === 'unavailable') redirect('/workspace?state=unavailable');
  if (options.requireNotices !== false && needsNoticeAcceptance(context.roleIds)) {
    const notices = await readEffectiveNotices(
      supabase,
      context.principal.id,
      await websiteLocale(),
    );
    if (!notices.accepted) redirect('/access/notices');
  }
  return context;
}
