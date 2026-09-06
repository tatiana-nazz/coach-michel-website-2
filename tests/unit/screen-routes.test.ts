import { describe, expect, it } from 'vitest';

import { governedScreenModules } from '@/features/screen-contract-registry';
import { buildScreenRoute, screenRouteDefinitions } from '@/platform/routing/screen-routes';

const expectedRoutes = {
  'SCR-PUB-001': {
    routeTemplate: '/',
    accessClass: 'PUBLIC_ANONYMOUS',
  },
  'SCR-PUB-002': {
    routeTemplate: '/about',
    accessClass: 'PUBLIC_ANONYMOUS',
  },
  'SCR-PUB-003': {
    routeTemplate: '/guidance',
    accessClass: 'PUBLIC_ANONYMOUS',
  },
  'SCR-PUB-004': {
    routeTemplate: '/disclosures',
    accessClass: 'PUBLIC_ANONYMOUS',
  },
  'SCR-PUB-005': {
    routeTemplate: '/next-steps',
    accessClass: 'PUBLIC_ANONYMOUS',
  },
  'SCR-ACC-001': {
    routeTemplate: '/access',
    accessClass: 'PRE_AUTH_OR_SESSION_NEUTRAL',
  },
  'SCR-ACC-002': {
    routeTemplate: '/access/provisioning',
    accessClass: 'PRE_AUTH_OR_SESSION_NEUTRAL',
  },
  'SCR-ACC-003': {
    routeTemplate: '/access/notices',
    accessClass: 'AUTHENTICATED_ACCESS_CONTEXT_REQUIRED',
  },
  'SCR-ACC-004': {
    routeTemplate: '/access/recovery',
    accessClass: 'PRE_AUTH_OR_SESSION_NEUTRAL',
  },
  'SCR-TRN-001': {
    routeTemplate: '/trainee/today',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-TRN-002': {
    routeTemplate: '/trainee/sessions',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-TRN-003': {
    routeTemplate: '/trainee/sessions/[sessionRef]/sequence',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-TRN-004': {
    routeTemplate: '/trainee/sessions/[sessionRef]/exercises/[exerciseRef]',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-TRN-005': {
    routeTemplate: '/trainee/sessions/[sessionRef]/completion',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-TRN-006': {
    routeTemplate: '/trainee/completions/[completionRef]',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-TRN-007': {
    routeTemplate: '/trainee/account',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-TRN-008': {
    routeTemplate: '/trainee/support',
    accessClass: 'TRAINEE_AUTHORITY_REQUIRED',
  },
  'SCR-COA-001': {
    routeTemplate: '/coach',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-002': {
    routeTemplate: '/coach/trainees',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-003': {
    routeTemplate: '/coach/trainees/[traineeRef]',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-004': {
    routeTemplate: '/coach/programs-sessions',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-005': {
    routeTemplate: '/coach/sessions/[sessionRef]/prepare',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-006': {
    routeTemplate: '/coach/exercises',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-007': {
    routeTemplate: '/coach/schedule-release',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-008': {
    routeTemplate: '/coach/completions',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-009': {
    routeTemplate: '/coach/reconciliation/[caseRef]',
    accessClass: 'COACH_AUTHORITY_REQUIRED',
  },
  'SCR-COA-010': {
    routeTemplate: '/coach/admin',
    accessClass: 'COACH_OR_ADMIN_AUTHORITY_REQUIRED_PER_GOVERNED_CONTEXT',
  },
  'SCR-OPS-001': {
    routeTemplate: '/ops/incidents',
    accessClass: 'OPS_AUTHORITY_REQUIRED',
  },
  'SCR-OPS-002': {
    routeTemplate: '/ops/recovery/[recoveryRef]',
    accessClass: 'OPS_AUTHORITY_REQUIRED',
  },
  'SCR-OPS-003': {
    routeTemplate: '/ops/recovery/[recoveryRef]/validation',
    accessClass: 'OPS_AUTHORITY_REQUIRED',
  },
  'SCR-OPS-004': {
    routeTemplate: '/ops/reconciliation/[reconciliationRef]',
    accessClass: 'OPS_AUTHORITY_REQUIRED',
  },
} as const;

describe('P4-S06 X-ROUTING-IA governed route registry', () => {
  it('binds all 31 governed screens to the selected material route topology exactly', () => {
    expect(governedScreenModules).toHaveLength(31);
    expect(Object.keys(screenRouteDefinitions)).toHaveLength(31);
    expect(screenRouteDefinitions).toEqual(expectedRoutes);
    expect(Object.keys(screenRouteDefinitions)).toEqual(
      governedScreenModules.map(({ screenId }) => screenId),
    );
  });

  it('keeps locale presentation state out of canonical route topology', () => {
    for (const definition of Object.values(screenRouteDefinitions)) {
      expect(definition.routeTemplate).not.toMatch(/^\/(?:en|ar)(?:\/|$)/);
    }
  });

  it('constructs dynamic routes from opaque references without interpreting identifier bytes', () => {
    expect(
      buildScreenRoute('SCR-TRN-004', {
        sessionRef: 'session/opaque',
        exerciseRef: 'exercise 1',
      }),
    ).toBe('/trainee/sessions/session%2Fopaque/exercises/exercise%201');
    expect(buildScreenRoute('SCR-OPS-003', { recoveryRef: 'recovery#opaque' })).toBe(
      '/ops/recovery/recovery%23opaque/validation',
    );
  });

  it('fails closed on missing, blank, or unexpected dynamic references', () => {
    expect(() => buildScreenRoute('SCR-TRN-003')).toThrow(
      'Missing opaque route reference: sessionRef',
    );
    expect(() => buildScreenRoute('SCR-COA-003', { traineeRef: '   ' })).toThrow(
      'Missing opaque route reference: traineeRef',
    );
    expect(() => buildScreenRoute('SCR-PUB-001', { locale: 'en' })).toThrow(
      'Unexpected route reference for SCR-PUB-001: locale',
    );
  });
});
