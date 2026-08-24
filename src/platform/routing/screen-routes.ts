import { governedScreenModules } from '@/features/screen-contract-registry';
export type GovernedScreenId = (typeof governedScreenModules)[number]['screenId'];
export const routeAccessClasses = [
  'PUBLIC_ANONYMOUS',
  'PRE_AUTH_OR_SESSION_NEUTRAL',
  'AUTHENTICATED_ACCESS_CONTEXT_REQUIRED',
  'TRAINEE_AUTHORITY_REQUIRED',
  'COACH_AUTHORITY_REQUIRED',
  'COACH_OR_ADMIN_AUTHORITY_REQUIRED_PER_GOVERNED_CONTEXT',
  'OPS_AUTHORITY_REQUIRED',
] as const;

export type RouteAccessClass = (typeof routeAccessClasses)[number];

export interface ScreenRouteDefinition {
  readonly routeTemplate: string;
  readonly accessClass: RouteAccessClass;
}

export const screenRouteDefinitions = {
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
} as const satisfies Readonly<Record<GovernedScreenId, ScreenRouteDefinition>>;

const routeParameterPattern = /\[([A-Za-z][A-Za-z0-9]*)\]/g;

function requiredRouteParameters(routeTemplate: string): readonly string[] {
  return Array.from(routeTemplate.matchAll(routeParameterPattern), (match) => match[1] ?? '');
}

function assertOpaqueReference(name: string, value: string | undefined): asserts value is string {
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing opaque route reference: ${name}`);
  }
}

export function getScreenRouteDefinition(screenId: GovernedScreenId): ScreenRouteDefinition {
  return screenRouteDefinitions[screenId];
}

export function buildScreenRoute(
  screenId: GovernedScreenId,
  params: Readonly<Record<string, string>> = {},
): string {
  const { routeTemplate } = getScreenRouteDefinition(screenId);
  const requiredParameters = requiredRouteParameters(routeTemplate);
  const requiredParameterSet = new Set(requiredParameters);

  for (const suppliedName of Object.keys(params)) {
    if (!requiredParameterSet.has(suppliedName)) {
      throw new Error(`Unexpected route reference for ${screenId}: ${suppliedName}`);
    }
  }

  return routeTemplate.replace(routeParameterPattern, (_match, parameterName: string) => {
    const value = params[parameterName];
    assertOpaqueReference(parameterName, value);
    return encodeURIComponent(value);
  });
}
