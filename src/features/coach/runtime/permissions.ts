import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { row, textValue, type CoachData, type CoachSection } from './types';

export const permissionKey = (
  capabilityId: string,
  resourceId: string,
  objectRef = '',
  subjectId = '',
) => JSON.stringify([capabilityId, resourceId, objectRef, subjectId]);

/** Uses the same role/object/subject evaluation as durable commands, without fetching private identity aliases. */
export async function coachPermissions(
  db: SupabaseClient,
  section: CoachSection,
  data: CoachData,
  actorId: string,
) {
  const checks = new Map<
    string,
    {
      key: string;
      capabilityId: string;
      resourceId: string;
      objectRef: string | null;
      subjectId: string | null;
    }
  >();
  const add = (capabilityId: string, resourceId: string, objectRef = '', subjectId = '') => {
    const key = permissionKey(capabilityId, resourceId, objectRef, subjectId);
    if (checks.has(key)) return;
    checks.set(key, {
      key: `permission-${checks.size}`,
      capabilityId,
      resourceId,
      objectRef: objectRef || null,
      subjectId: subjectId || null,
    });
  };
  if (section === 'programs') add('CAP-008', 'RES-009', '', actorId);
  if (section === 'programs' || section === 'prepare')
    for (const item of data.primary.items)
      add('CAP-008', 'RES-009', item.ref, textValue(item.extra.ownerPrincipalId));
  if (section === 'exercises') {
    add('CAP-009', 'RES-008', '', actorId);
    for (const item of data.primary.items) {
      add('CAP-009', 'RES-008', item.ref, textValue(item.extra.creatorPrincipalId));
      add('CAP-010', 'RES-008', item.ref, textValue(item.extra.versionCreatorPrincipalId));
    }
  }
  if (section === 'release')
    for (const item of data.primary.items)
      add('CAP-012', 'RES-010', '', textValue(item.extra.principalId));
  if (section === 'completions')
    for (const item of data.primary.items) {
      const subjectId = textValue(item.extra.subjectPrincipalId);
      add('CAP-013', 'RES-012', item.ref, subjectId);
      add('CAP-013', 'RES-013', '', subjectId);
    }
  if (section === 'reconciliation')
    for (const item of data.primary.items) {
      const subjectId = textValue(item.extra.subjectPrincipalId),
        completionRef = textValue(row(item.extra.proposal).completionRef);
      for (const cap of ['CAP-013', 'CAP-014']) {
        add(cap, 'RES-013', item.ref, subjectId);
        add(cap, 'RES-012', completionRef, subjectId);
      }
    }
  if (section === 'admin') {
    add('CAP-010', 'RES-002');
    add('CAP-011', 'RES-015');
    for (const item of data.primary.items) add('CAP-011', 'RES-015', item.versionRef);
    for (const item of data.disclosures?.items ?? []) add('CAP-010', 'RES-002', item.ref);
    for (const item of data.secondary.items)
      add('CAP-016', 'RES-014', item.ref, textValue(item.extra.subjectPrincipalId));
    for (const item of data.authority?.principals ?? [])
      add('CAP-015', 'RES-005', '', textValue(item.extra.principalId));
    for (const item of data.authority?.grants ?? [])
      add('CAP-015', 'RES-005', item.ref, textValue(item.extra.principalId));
  }
  const entries = [...checks.values()];
  const identities = new Map(
    [...checks.entries()].map(([identity, check]) => [check.key, identity]),
  );
  const outcomes: Record<string, boolean> = {};
  let unavailable = false;
  try {
    const responses = await Promise.all(
      Array.from({ length: Math.ceil(entries.length / 200) }, (_, index) =>
        db.rpc('cmh_permission_checks', {
          p_checks: entries.slice(index * 200, index * 200 + 200),
        }),
      ),
    );
    for (const response of responses) {
      if (response.error) {
        unavailable = true;
        continue;
      }
      for (const [key, value] of Object.entries(row(response.data))) {
        const identity = identities.get(key);
        if (identity && typeof value === 'boolean') outcomes[identity] = value;
      }
    }
  } catch {
    unavailable = true;
  }
  return {
    unavailable,
    can: (capabilityId: string, resourceId: string, objectRef = '', subjectId = '') =>
      outcomes[permissionKey(capabilityId, resourceId, objectRef, subjectId)] === true,
  };
}
