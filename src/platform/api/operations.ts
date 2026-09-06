import { deliveryOperationRegistry } from './delivery-operations';
export type ApiOperationMethod = 'GET' | 'POST' | 'PATCH';

export interface OperationDescriptor {
  readonly operationId: string;
  readonly contractReference: string;
  readonly method?: ApiOperationMethod;
  readonly path?: string;
}

export interface OperationRegistry {
  get(operationId: string): OperationDescriptor | undefined;
}

export const ESTABLISH_SESSION_OPERATION_ID = 'p3s11_scr_acc_001_establish_session_1';

export const productionOperationDescriptors = [
  {
    operationId: 'p3s11_apin_001_get_1',
    contractReference: 'API-CMH-P3S11-APIN-001',
    method: 'GET',
    path: '/public/overview',
  },
  {
    operationId: 'p3s11_apin_002_get_1',
    contractReference: 'API-CMH-P3S11-APIN-002',
    method: 'GET',
    path: '/public/guidance',
  },
  {
    operationId: 'p3s11_apin_003_get_1',
    contractReference: 'API-CMH-P3S11-APIN-003',
    method: 'GET',
    path: '/public/guidance/{public_content_ref}',
  },
  {
    operationId: 'p3s11_apin_004_get_1',
    contractReference: 'API-CMH-P3S11-APIN-004',
    method: 'GET',
    path: '/disclosures/effective',
  },
  {
    operationId: 'p3s11_apin_005_get_1',
    contractReference: 'API-CMH-P3S11-APIN-005',
    method: 'GET',
    path: '/public/next-step-options',
  },
  {
    operationId: 'p3s11_apin_039_patch_1',
    contractReference: 'API-CMH-P3S11-APIN-039',
    method: 'PATCH',
    path: '/support-privacy-cases/{case_ref}',
  },
  {
    operationId: 'p3s11_apin_006_get_1',
    contractReference: 'API-CMH-P3S11-APIN-006',
    method: 'GET',
    path: '/access/context',
  },
  {
    operationId: 'p3s11_apin_007_get_1',
    contractReference: 'API-CMH-P3S11-APIN-007',
    method: 'GET',
    path: '/access/provisioning-status',
  },
  {
    operationId: 'p3s11_apin_035_post_1',
    contractReference: 'API-CMH-P3S11-APIN-035',
    method: 'POST',
    path: '/access-administration/authority-changes',
  },
  {
    operationId: 'p3s11_apin_008_get_1',
    contractReference: 'API-CMH-P3S11-APIN-008',
    method: 'GET',
    path: '/access/notices/effective',
  },
  {
    operationId: 'p3s11_apin_009_post_1',
    contractReference: 'API-CMH-P3S11-APIN-009',
    method: 'POST',
    path: '/access/acceptance-records',
  },
  {
    operationId: 'p3s11_apin_010_post_1',
    contractReference: 'API-CMH-P3S11-APIN-010',
    method: 'POST',
    path: '/access/recovery-requests',
  },
  {
    operationId: 'p3s11_apin_011_get_1',
    contractReference: 'API-CMH-P3S11-APIN-011',
    method: 'GET',
    path: '/access/recovery-requests/{recovery_ref}',
  },
  {
    operationId: 'p3s11_apin_012_get_1',
    contractReference: 'API-CMH-P3S11-APIN-012',
    method: 'GET',
    path: '/trainee/today',
  },
  {
    operationId: 'p3s11_apin_013_get_1',
    contractReference: 'API-CMH-P3S11-APIN-013',
    method: 'GET',
    path: '/trainee/sessions/{session_ref}',
  },
  {
    operationId: 'p3s11_apin_014_get_1',
    contractReference: 'API-CMH-P3S11-APIN-014',
    method: 'GET',
    path: '/trainee/session-schedules/{session_schedule_ref}/exercise-sequence',
  },
  {
    operationId: 'p3s11_apin_015_get_1',
    contractReference: 'API-CMH-P3S11-APIN-015',
    method: 'GET',
    path: '/trainee/session-schedules/{session_schedule_ref}/exercise-guidance',
  },
  {
    operationId: 'p3s11_apin_016_post_1',
    contractReference: 'API-CMH-P3S11-APIN-016',
    method: 'POST',
    path: '/trainee/session-schedules/{schedule_ref}/completion-intents',
  },
  {
    operationId: 'p3s11_apin_017_get_1',
    contractReference: 'API-CMH-P3S11-APIN-017',
    method: 'GET',
    path: '/completion-state/{schedule_completion_or_case_ref}',
  },
  {
    operationId: 'p3s11_apin_018_get_1',
    contractReference: 'API-CMH-P3S11-APIN-018',
    method: 'GET',
    path: '/account/context',
  },
  {
    operationId: 'p3s11_apin_019_post_1',
    contractReference: 'API-CMH-P3S11-APIN-019',
    method: 'POST',
    path: '/support-privacy-requests',
  },
  {
    operationId: 'p3s11_apin_020_get_1',
    contractReference: 'API-CMH-P3S11-APIN-020',
    method: 'GET',
    path: '/coach/overview',
  },
  {
    operationId: 'p3s11_apin_021_get_1',
    contractReference: 'API-CMH-P3S11-APIN-021',
    method: 'GET',
    path: '/coach/trainees',
  },
  {
    operationId: 'p3s11_apin_022_get_1',
    contractReference: 'API-CMH-P3S11-APIN-022',
    method: 'GET',
    path: '/coach/trainees/{trainee_ref}',
  },
  {
    operationId: 'p3s11_apin_023_program_collection',
    contractReference: 'API-CMH-P3S11-APIN-023',
    method: 'GET',
    path: '/coach/programs',
  },
  {
    operationId: 'p3s11_apin_023_session_collection',
    contractReference: 'API-CMH-P3S11-APIN-023',
    method: 'GET',
    path: '/coach/sessions',
  },
  {
    operationId: 'p3s11_apin_024_program_draft',
    contractReference: 'API-CMH-P3S11-APIN-024',
    method: 'GET',
    path: '/coach/programs/{program_ref}/draft',
  },
  {
    operationId: 'p3s11_apin_024_session_draft',
    contractReference: 'API-CMH-P3S11-APIN-024',
    method: 'GET',
    path: '/coach/sessions/{session_ref}/draft',
  },
  {
    operationId: 'p3s11_apin_025_create_program_draft',
    contractReference: 'API-CMH-P3S11-APIN-025',
    method: 'POST',
    path: '/coach/program-drafts',
  },
  {
    operationId: 'p3s11_apin_025_revise_program_draft',
    contractReference: 'API-CMH-P3S11-APIN-025',
    method: 'PATCH',
    path: '/coach/program-drafts/{draft_ref}',
  },
  {
    operationId: 'p3s11_apin_025_create_session_draft',
    contractReference: 'API-CMH-P3S11-APIN-025',
    method: 'POST',
    path: '/coach/session-drafts',
  },
  {
    operationId: 'p3s11_apin_025_revise_session_draft',
    contractReference: 'API-CMH-P3S11-APIN-025',
    method: 'PATCH',
    path: '/coach/session-drafts/{draft_ref}',
  },
  {
    operationId: 'p3s11_apin_027_create_content_draft',
    contractReference: 'API-CMH-P3S11-APIN-027',
    method: 'POST',
    path: '/coach/content-drafts',
  },
  {
    operationId: 'p3s11_apin_027_revise_content_draft',
    contractReference: 'API-CMH-P3S11-APIN-027',
    method: 'PATCH',
    path: '/coach/content-drafts/{draft_ref}',
  },
  {
    operationId: 'p3s11_apin_026_get_1',
    contractReference: 'API-CMH-P3S11-APIN-026',
    method: 'GET',
    path: '/coach/exercises',
  },
  {
    operationId: 'p3s11_apin_028_post_1',
    contractReference: 'API-CMH-P3S11-APIN-028',
    method: 'POST',
    path: '/content-publication-decisions',
  },
  {
    operationId: 'p3s11_apin_029_post_1',
    contractReference: 'API-CMH-P3S11-APIN-029',
    method: 'POST',
    path: '/coach/schedule-release-previews',
  },
  {
    operationId: 'p3s11_apin_030_post_1',
    contractReference: 'API-CMH-P3S11-APIN-030',
    method: 'POST',
    path: '/coach/assignment-release-commands',
  },
  {
    operationId: 'p3s11_apin_036_get_1',
    contractReference: 'API-CMH-P3S11-APIN-036',
    method: 'GET',
    path: '/policies',
  },
  {
    operationId: 'p3s11_apin_031_get_1',
    contractReference: 'API-CMH-P3S11-APIN-031',
    method: 'GET',
    path: '/coach/completion-monitoring',
  },
  {
    operationId: 'p3s11_apin_032_post_1',
    contractReference: 'API-CMH-P3S11-APIN-032',
    method: 'POST',
    path: '/reconciliation-cases',
  },
  {
    operationId: 'p3s11_apin_033_read_case',
    contractReference: 'API-CMH-P3S11-APIN-033',
    method: 'GET',
    path: '/reconciliation-cases/{case_ref}',
  },
  {
    operationId: 'p3s11_apin_033_update_proposal',
    contractReference: 'API-CMH-P3S11-APIN-033',
    method: 'PATCH',
    path: '/reconciliation-cases/{case_ref}/proposal',
  },
  {
    operationId: 'p3s11_apin_034_post_1',
    contractReference: 'API-CMH-P3S11-APIN-034',
    method: 'POST',
    path: '/reconciliation-cases/{case_ref}/authorization-decisions',
  },
  {
    operationId: 'p3s11_apin_044_get_1',
    contractReference: 'API-CMH-P3S11-APIN-044',
    method: 'GET',
    path: '/audit-events',
  },
  {
    operationId: 'p3s11_apin_037_post_1',
    contractReference: 'API-CMH-P3S11-APIN-037',
    method: 'POST',
    path: '/policy-approval-decisions',
  },
  {
    operationId: 'p3s11_apin_038_collection',
    contractReference: 'API-CMH-P3S11-APIN-038',
    method: 'GET',
    path: '/support-privacy-cases',
  },
  {
    operationId: 'p3s11_apin_038_detail',
    contractReference: 'API-CMH-P3S11-APIN-038',
    method: 'GET',
    path: '/support-privacy-cases/{case_ref}',
  },
  {
    operationId: 'p3s11_apin_040_intake',
    contractReference: 'API-CMH-P3S11-APIN-040',
    method: 'POST',
    path: '/operational-incidents',
  },
  {
    operationId: 'p3s11_apin_040_collection',
    contractReference: 'API-CMH-P3S11-APIN-040',
    method: 'GET',
    path: '/operational-incidents',
  },
  {
    operationId: 'p3s11_apin_040_detail',
    contractReference: 'API-CMH-P3S11-APIN-040',
    method: 'GET',
    path: '/operational-incidents/{incident_ref}',
  },
  {
    operationId: 'p3s11_apin_048_get_1',
    contractReference: 'API-CMH-P3S11-APIN-048',
    method: 'GET',
    path: '/operational-dependencies/readiness',
  },
  {
    operationId: 'p3s11_apin_041_post_1',
    contractReference: 'API-CMH-P3S11-APIN-041',
    method: 'POST',
    path: '/operational-incidents/{incident_ref}/recovery-activities',
  },
  {
    operationId: 'p3s11_apin_042_read_validation_context',
    contractReference: 'API-CMH-P3S11-APIN-042',
    method: 'GET',
    path: '/recovery-activities/{recovery_activity_ref}/validation',
  },
  {
    operationId: 'p3s11_apin_042_submit_validation',
    contractReference: 'API-CMH-P3S11-APIN-042',
    method: 'POST',
    path: '/recovery-activities/{recovery_activity_ref}/validation-submissions',
  },
  {
    operationId: 'p3s11_apin_043_post_1',
    contractReference: 'API-CMH-P3S11-APIN-043',
    method: 'POST',
    path: '/recovery-validations/{validation_ref}/state-reconciliation-handoffs',
  },
] as const satisfies readonly OperationDescriptor[];

const operationDescriptors = new Map<string, OperationDescriptor>([
  [
    ESTABLISH_SESSION_OPERATION_ID,
    {
      operationId: ESTABLISH_SESSION_OPERATION_ID,
      contractReference: 'ART-CMH-P3-S11-RL4382-SUPABASE-CREDENTIAL-SUBMISSION-REV4384-001',
      method: 'POST',
      path: '/access/session',
    },
  ],
  ...productionOperationDescriptors.map(
    (descriptor) => [descriptor.operationId, descriptor] as const,
  ),
]);

export const operationRegistry: OperationRegistry = {
  get: (operationId) =>
    operationDescriptors.get(operationId) ?? deliveryOperationRegistry.get(operationId),
};

/** Preserved empty registry for scaffold-era consumers that explicitly require no production operations. */
export const emptyOperationRegistry: OperationRegistry = {
  get: () => undefined,
};
