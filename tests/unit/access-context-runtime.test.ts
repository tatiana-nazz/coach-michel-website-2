import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  readAccessContext,
  readEffectiveNotices,
  noticeText,
} from '@/platform/auth/access-context';
const user = {
  id: 'auth-user-a',
  is_anonymous: false,
  user_metadata: { role: 'admin' },
} as unknown as User;
const grant = {
  role_id: 'ROL-003',
  capability_id: 'CAP-004',
  resource_id: 'RES-010',
  object_ref: null,
  subject_ref: null,
  valid_from: '2020-01-01T00:00:00Z',
  valid_until: null,
  revoked_at: null,
};
function fakeClient(results: Record<string, { data: unknown; error: unknown }>) {
  const filters: unknown[][] = [];
  const from = vi.fn((table: string) => {
    const response = results[table] ?? { data: null, error: null };
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn((...args: unknown[]) => {
        filters.push([table, ...args]);
        return chain;
      }),
      is: vi.fn(() => chain),
      in: vi.fn(() => chain),
      maybeSingle: vi.fn(async () => response),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve),
    };
    return chain;
  });
  return { client: { from } as unknown as SupabaseClient, from, filters };
}
const version = {
  id: 'v1',
  disclosure_document_id: 'doc-a',
  version_ref: 'terms-v1-en',
  version_number: 1,
  locale: 'en',
  body: { title: 'Terms', body: 'Review these terms.' },
  effective_from: '2020-01-01',
  effective_until: null,
};
describe('server access context', () => {
  it('uses current app principal and active grants, ignoring editable metadata', async () => {
    const { client, filters } = fakeClient({
      app_principals: {
        data: { id: 'principal-a', principal_ref: 'member-a', status: 'ACTIVE' },
        error: null,
      },
      principal_grants: {
        data: [grant, { ...grant, role_id: 'ROL-004', revoked_at: '2020-01-01' }],
        error: null,
      },
    });
    const result = await readAccessContext(client, user);
    expect(result.status).toBe('ready');
    if (result.status === 'ready') expect(result.roleIds).toEqual(['ROL-003']);
    expect(filters).toContainEqual(['app_principals', 'auth_user_id', 'auth-user-a']);
    expect(filters).toContainEqual(['principal_grants', 'principal_id', 'principal-a']);
  });
  it('denies unprovisioned accounts and reports dependency errors distinctly', async () => {
    expect((await readAccessContext(fakeClient({}).client, user)).status).toBe('forbidden');
    expect(
      (
        await readAccessContext(
          fakeClient({ app_principals: { data: null, error: { code: 'timeout' } } }).client,
          user,
        )
      ).status,
    ).toBe('unavailable');
  });
  it('does not read private tables for anonymous identities', async () => {
    const { client, from } = fakeClient({});
    expect((await readAccessContext(client, { ...user, is_anonymous: true })).status).toBe(
      'anonymous',
    );
    expect(from).not.toHaveBeenCalled();
  });
  it('shows Arabic while retaining exact English acceptance evidence for the same current version', async () => {
    const { client } = fakeClient({
      disclosure_versions: {
        data: [version, { ...version, id: 'v2-ar', locale: 'ar', version_ref: 'terms-v1-ar' }],
        error: null,
      },
      acceptance_records: {
        data: [
          { disclosure_version_id: 'v1', decision: 'ACCEPTED', decided_at: '2026-01-01T00:00:00Z' },
        ],
        error: null,
      },
    });
    const result = await readEffectiveNotices(client, 'principal-a', 'ar');
    expect(result.available).toBe(true);
    expect(result.accepted).toBe(true);
    expect(result.notices[0]?.decision).toBeNull();
    expect(result.notices[0]?.acceptedInLocale).toBe('en');
    expect(result.notices[0]?.versionRef).toBe('terms-v1-ar');
  });
  it('falls back to English and ignores expired/future versions', async () => {
    const { client } = fakeClient({
      disclosure_versions: {
        data: [
          version,
          { ...version, id: 'future', version_number: 3, effective_from: '2100-01-01' },
          { ...version, id: 'expired', version_number: 2, effective_until: '2021-01-01' },
        ],
        error: null,
      },
      acceptance_records: {
        data: [
          { disclosure_version_id: 'v1', decision: 'ACCEPTED', decided_at: '2026-01-01T00:00:00Z' },
        ],
        error: null,
      },
    });
    const result = await readEffectiveNotices(client, 'principal-a', 'ar');
    expect(result.accepted).toBe(true);
    expect(result.notices).toHaveLength(1);
    expect(result.notices[0]?.id).toBe('v1');
  });
  it('fails closed on empty, malformed, unreadable or declined notices', async () => {
    for (const versions of [[], [{ ...version, body: { title: 'Empty' } }]]) {
      const result = await readEffectiveNotices(
        fakeClient({
          disclosure_versions: { data: versions, error: null },
          acceptance_records: { data: [], error: null },
        }).client,
        'principal-a',
        'en',
      );
      expect(result.available).toBe(false);
      expect(result.accepted).toBe(false);
    }
    const result = await readEffectiveNotices(
      fakeClient({
        disclosure_versions: { data: [version], error: null },
        acceptance_records: {
          data: [
            {
              disclosure_version_id: 'v1',
              decision: 'DECLINED',
              decided_at: '2026-01-01T00:00:00Z',
            },
          ],
          error: null,
        },
      }).client,
      'principal-a',
      'en',
    );
    expect(result.available).toBe(true);
    expect(result.accepted).toBe(false);
    expect(noticeText('<script>bad</script>')).toBeNull();
  });
  it('never chooses an older translation or treats its acceptance as current', async () => {
    const { client } = fakeClient({
      disclosure_versions: {
        data: [
          version,
          { ...version, id: 'v2', version_number: 2, version_ref: 'terms-v2-en' },
          { ...version, id: 'v1-ar', locale: 'ar', version_ref: 'terms-v1-ar' },
        ],
        error: null,
      },
      acceptance_records: {
        data: [
          {
            disclosure_version_id: 'v1-ar',
            decision: 'ACCEPTED',
            decided_at: '2026-01-01T00:00:00Z',
          },
        ],
        error: null,
      },
    });
    const result = await readEffectiveNotices(client, 'principal-a', 'ar');
    expect(result.accepted).toBe(false);
    expect(result.notices[0]?.versionRef).toBe('terms-v2-en');
  });
  it('honors a later explicit decline across equivalent translations', async () => {
    const { client } = fakeClient({
      disclosure_versions: {
        data: [version, { ...version, id: 'v1-ar', locale: 'ar', version_ref: 'terms-v1-ar' }],
        error: null,
      },
      acceptance_records: {
        data: [
          { disclosure_version_id: 'v1', decision: 'ACCEPTED', decided_at: '2026-01-01T00:00:00Z' },
          {
            disclosure_version_id: 'v1-ar',
            decision: 'DECLINED',
            decided_at: '2026-01-02T00:00:00Z',
          },
        ],
        error: null,
      },
    });
    expect((await readEffectiveNotices(client, 'principal-a', 'en')).accepted).toBe(false);
  });
});
