export const GOVERNED_ROLE_IDS = [
  'ROL-001',
  'ROL-002',
  'ROL-003',
  'ROL-004',
  'ROL-005',
  'ROL-006',
  'ROL-007',
  'ROL-008',
  'ROL-009',
  'ROL-010',
  'ROL-011',
  'ROL-012',
] as const;

export const GOVERNED_CAPABILITY_IDS = [
  'CAP-001',
  'CAP-002',
  'CAP-003',
  'CAP-004',
  'CAP-005',
  'CAP-006',
  'CAP-007',
  'CAP-008',
  'CAP-009',
  'CAP-010',
  'CAP-011',
  'CAP-012',
  'CAP-013',
  'CAP-014',
  'CAP-015',
  'CAP-016',
  'CAP-017',
  'CAP-018',
  'CAP-019',
  'CAP-020',
] as const;

export const GOVERNED_RESOURCE_IDS = [
  'RES-001',
  'RES-002',
  'RES-003',
  'RES-004',
  'RES-005',
  'RES-006',
  'RES-007',
  'RES-008',
  'RES-009',
  'RES-010',
  'RES-011',
  'RES-012',
  'RES-013',
  'RES-014',
  'RES-015',
  'RES-016',
  'RES-017',
  'RES-018',
  'RES-019',
] as const;

export const GOVERNED_SCOPE_IDS = [
  'SCP-001',
  'SCP-002',
  'SCP-003',
  'SCP-004',
  'SCP-005',
  'SCP-006',
  'SCP-007',
] as const;

export type GovernedRoleId = (typeof GOVERNED_ROLE_IDS)[number];
export type GovernedCapabilityId = (typeof GOVERNED_CAPABILITY_IDS)[number];
export type GovernedResourceId = (typeof GOVERNED_RESOURCE_IDS)[number];
export type GovernedScopeId = (typeof GOVERNED_SCOPE_IDS)[number];

export type AuthorityEvidenceStatus =
  | 'current'
  | 'missing'
  | 'stale'
  | 'contradictory'
  | 'unavailable';

export interface ScopedAuthorizationFacts {
  readonly authorityEvidenceStatus: AuthorityEvidenceStatus;
  readonly roleEvidenceCurrent: boolean;
  readonly grantEvidenceCurrent: boolean;
  readonly capabilityAllowed: boolean;
  readonly businessScopeAllowed: boolean;
  readonly subjectScopeAllowed: boolean;
  readonly resourceScopeAllowed: boolean;
  readonly purposeScopeAllowed: boolean;
  readonly contextScopeAllowed: boolean;
  readonly lifecycleAllowed: boolean;
  readonly incidentAllowed: boolean;
  readonly recoveryAllowed: boolean;
}

export interface ScopedAuthorizationDecision {
  readonly allowed: boolean;
}

export function evaluateScopedAuthorization(
  facts: ScopedAuthorizationFacts,
): ScopedAuthorizationDecision {
  if (facts.authorityEvidenceStatus !== 'current') {
    return { allowed: false };
  }

  return {
    allowed:
      facts.roleEvidenceCurrent &&
      facts.grantEvidenceCurrent &&
      facts.capabilityAllowed &&
      facts.businessScopeAllowed &&
      facts.subjectScopeAllowed &&
      facts.resourceScopeAllowed &&
      facts.purposeScopeAllowed &&
      facts.contextScopeAllowed &&
      facts.lifecycleAllowed &&
      facts.incidentAllowed &&
      facts.recoveryAllowed,
  };
}
