export interface ActiveGrant {
  role_id: string;
  capability_id: string;
  resource_id: string;
  object_ref: string | null;
  subject_ref: string | null;
  valid_from: string;
  valid_until: string | null;
  revoked_at: string | null;
}

export function activeGrants(grants: readonly ActiveGrant[], now = Date.now()): ActiveGrant[] {
  return grants.filter(
    (grant) =>
      grant.revoked_at === null &&
      Date.parse(grant.valid_from) <= now &&
      (grant.valid_until === null || Date.parse(grant.valid_until) > now),
  );
}

export function hasWorkspaceGrant(
  grants: readonly ActiveGrant[],
  request: {
    capabilityId: string;
    resourceId: string;
    objectRef?: string;
    subjectRef?: string;
  },
): boolean {
  return activeGrants(grants).some(
    (grant) =>
      grant.capability_id === request.capabilityId &&
      grant.resource_id === request.resourceId &&
      (grant.object_ref === null || grant.object_ref === request.objectRef) &&
      (grant.subject_ref === null || grant.subject_ref === request.subjectRef),
  );
}

export function workspaceDestination(roleIds: readonly string[]): string | null {
  if (roleIds.some((role) => ['ROL-004', 'ROL-005', 'ROL-006', 'ROL-007'].includes(role)))
    return '/coach';
  if (roleIds.includes('ROL-008')) return '/coach/admin';
  if (roleIds.some((role) => ['ROL-009', 'ROL-010', 'ROL-011'].includes(role)))
    return '/ops/incidents';
  if (roleIds.includes('ROL-003')) return '/trainee/today';
  if (roleIds.includes('ROL-002')) return '/access/provisioning';
  return null;
}

export function needsNoticeAcceptance(roleIds: readonly string[]): boolean {
  return (
    (roleIds.includes('ROL-003') || roleIds.includes('ROL-002')) &&
    !roleIds.some((role) =>
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
  );
}

/** A small fixed target set prevents open redirects and redirect chains. */
export function safeAccessRedirect(value: string | null | undefined): string {
  return value === '/access/password' || value === '/workspace' ? value : '/workspace';
}
