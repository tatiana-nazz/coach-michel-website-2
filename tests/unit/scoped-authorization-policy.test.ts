import { describe, expect, it } from 'vitest';

import {
  evaluateScopedAuthorization,
  GOVERNED_CAPABILITY_IDS,
  GOVERNED_RESOURCE_IDS,
  GOVERNED_ROLE_IDS,
  GOVERNED_SCOPE_IDS,
  type AuthorityEvidenceStatus,
  type ScopedAuthorizationFacts,
} from '@/platform/authorization/scoped-policy';

const allowedFacts: ScopedAuthorizationFacts = {
  authorityEvidenceStatus: 'current',
  roleEvidenceCurrent: true,
  grantEvidenceCurrent: true,
  capabilityAllowed: true,
  businessScopeAllowed: true,
  subjectScopeAllowed: true,
  resourceScopeAllowed: true,
  purposeScopeAllowed: true,
  contextScopeAllowed: true,
  lifecycleAllowed: true,
  incidentAllowed: true,
  recoveryAllowed: true,
};

const nonCurrentAuthorityEvidence = [
  'missing',
  'stale',
  'contradictory',
  'unavailable',
] as const satisfies readonly AuthorityEvidenceStatus[];

const requiredAuthorityAndScopeFields = [
  'roleEvidenceCurrent',
  'grantEvidenceCurrent',
  'capabilityAllowed',
  'businessScopeAllowed',
  'subjectScopeAllowed',
  'resourceScopeAllowed',
  'purposeScopeAllowed',
  'contextScopeAllowed',
] as const;

type RequiredAuthorityAndScopeField = (typeof requiredAuthorityAndScopeFields)[number];

const operationalGuardFields = ['lifecycleAllowed', 'incidentAllowed', 'recoveryAllowed'] as const;

type OperationalGuardField = (typeof operationalGuardFields)[number];

describe('scoped authorization policy', () => {
  it.each(nonCurrentAuthorityEvidence)(
    'fails closed for %s authority evidence',
    (authorityEvidenceStatus: AuthorityEvidenceStatus) => {
      expect(evaluateScopedAuthorization({ ...allowedFacts, authorityEvidenceStatus })).toEqual({
        allowed: false,
      });
    },
  );

  it.each(requiredAuthorityAndScopeFields)(
    'denies when %s is absent',
    (field: RequiredAuthorityAndScopeField) => {
      expect(evaluateScopedAuthorization({ ...allowedFacts, [field]: false })).toEqual({
        allowed: false,
      });
    },
  );

  it.each(operationalGuardFields)(
    'denies while %s is false',
    (field: OperationalGuardField) => {
      expect(evaluateScopedAuthorization({ ...allowedFacts, [field]: false })).toEqual({
        allowed: false,
      });
    },
  );

  it('allows only when all explicit current authority and scope facts pass', () => {
    expect(evaluateScopedAuthorization(allowedFacts)).toEqual({ allowed: true });
  });

  it('exposes only the governed identifier vocabulary counts', () => {
    expect(GOVERNED_ROLE_IDS).toHaveLength(12);
    expect(GOVERNED_CAPABILITY_IDS).toHaveLength(20);
    expect(GOVERNED_RESOURCE_IDS).toHaveLength(19);
    expect(GOVERNED_SCOPE_IDS).toHaveLength(7);

    expect(GOVERNED_ROLE_IDS[0]).toBe('ROL-001');
    expect(GOVERNED_ROLE_IDS.at(-1)).toBe('ROL-012');
    expect(GOVERNED_CAPABILITY_IDS[0]).toBe('CAP-001');
    expect(GOVERNED_CAPABILITY_IDS.at(-1)).toBe('CAP-020');
    expect(GOVERNED_RESOURCE_IDS[0]).toBe('RES-001');
    expect(GOVERNED_RESOURCE_IDS.at(-1)).toBe('RES-019');
    expect(GOVERNED_SCOPE_IDS[0]).toBe('SCP-001');
    expect(GOVERNED_SCOPE_IDS.at(-1)).toBe('SCP-007');
  });
});
