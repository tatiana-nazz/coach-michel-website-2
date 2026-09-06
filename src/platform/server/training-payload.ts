import { z } from 'zod';

const ref = z.string().trim().min(1).max(200);
const reason = z.string().trim().min(3).max(2000);
const optionalText = z.string().max(6000).optional();
const baseDraft = z
  .object({
    title: z.string().trim().min(2).max(160),
    description: optionalText,
    reason,
    expectedVersion: z.number().int().positive().optional(),
    durationMinutes: z.number().int().min(1).max(600).optional(),
    exerciseRefs: z.array(ref).max(100).optional(),
    exercises: z
      .array(
        z.object({
          exerciseRef: ref,
          sets: z.number().int().min(1).max(100),
          reps: z.string().max(100),
          restSeconds: z.number().int().min(0).max(3600),
        }),
      )
      .max(100)
      .optional(),
  })
  .strict();
const contentDraft = z
  .object({
    title: z.string().trim().min(2).max(160),
    description: optionalText,
    instructions: z.union([z.string().max(16000), z.array(z.string().max(2000)).max(40)]),
    locale: z.enum(['en', 'ar']),
    reason,
    expectedVersion: z.number().int().positive().optional(),
    videoUrl: z
      .union([z.literal(''), z.url().refine((value) => new URL(value).protocol === 'https:')])
      .optional(),
  })
  .strict();
const publication = z
  .object({
    versionRef: ref,
    decision: z.enum(['APPROVE', 'DENY']),
    reason,
    effectiveFrom: z.iso.datetime({ offset: true }).optional(),
  })
  .strict();
const release = z
  .object({
    traineeRef: ref,
    sessionVersionRef: ref,
    scheduledFor: z.iso.datetime({ offset: true }),
    reason,
    businessIntentRef: ref.optional(),
    previewRef: ref.optional(),
  })
  .strict();
const proposal = z
  .object({
    completionRef: ref,
    expectedVersion: z.number().int().positive(),
    newState: z.record(z.string(), z.unknown()),
  })
  .strict();
const disclosureDraft = z
  .object({
    title: z.string().trim().min(2).max(160),
    body: z.string().trim().min(20).max(16000),
    locale: z.enum(['en', 'ar']),
    reason,
    expectedVersion: z.number().int().positive().optional(),
  })
  .strict();
const policyDraft = z
  .object({
    title: z.string().trim().min(2).max(160),
    reason,
    timezone: z.literal('UTC'),
    maxAdvanceDays: z.number().int().min(1).max(730),
    allowPastDays: z.number().int().min(0).max(1),
    expectedVersion: z.number().int().positive().optional(),
  })
  .strict();
const schemas: Record<string, z.ZodType> = {
  delivery_create_disclosure_draft: disclosureDraft,
  delivery_revise_disclosure_draft: disclosureDraft.refine(
    (value) => value.expectedVersion !== undefined,
  ),
  delivery_create_policy_draft: policyDraft,
  delivery_revise_policy_draft: policyDraft.refine((value) => value.expectedVersion !== undefined),
  p3s11_apin_016_post_1: z
    .object({
      businessIntentRef: ref,
      clientEvidenceContext: z
        .object({
          note: z.string().max(2000).optional(),
          reportedCompletedAt: z.iso.datetime({ offset: true }).optional(),
        })
        .strict(),
    })
    .strict(),
  p3s11_apin_025_create_program_draft: baseDraft,
  p3s11_apin_025_revise_program_draft: baseDraft.refine(
    (value) => value.expectedVersion !== undefined,
  ),
  p3s11_apin_025_create_session_draft: baseDraft,
  p3s11_apin_025_revise_session_draft: baseDraft.refine(
    (value) => value.expectedVersion !== undefined,
  ),
  p3s11_apin_027_create_content_draft: contentDraft,
  p3s11_apin_027_revise_content_draft: contentDraft.refine(
    (value) => value.expectedVersion !== undefined,
  ),
  p3s11_apin_028_post_1: publication,
  p3s11_apin_029_post_1: release,
  p3s11_apin_030_post_1: release.refine((value) => value.businessIntentRef !== undefined),
  p3s11_apin_032_post_1: z
    .object({ affectedReferences: z.array(ref).min(1).max(20), reason, proposal })
    .strict(),
  p3s11_apin_033_update_proposal: z
    .object({ reason, proposal, expectedVersion: z.number().int().positive() })
    .strict(),
  p3s11_apin_034_post_1: z
    .object({ proposalRef: ref, decision: z.enum(['APPROVE', 'DENY']), reason })
    .strict(),
  p3s11_apin_037_post_1: publication,
  p3s11_apin_035_post_1: z.discriminatedUnion('action', [
    z.object({ action: z.literal('REVOKE_GRANT'), grantRef: ref, reason }).strict(),
    z
      .object({
        action: z.literal('GRANT'),
        principalRef: ref,
        roleId: z.string().regex(/^ROL-\d{3}$/),
        capabilityId: z.string().regex(/^CAP-\d{3}$/),
        resourceId: z.string().regex(/^RES-\d{3}$/),
        objectRef: ref.optional(),
        subjectRef: ref.optional(),
        validUntil: z.iso.datetime({ offset: true }).optional(),
        reason,
      })
      .strict(),
  ]),
};

export function trainingCommandPayload(
  operationId: string,
  body: unknown,
  params: Record<string, string> = {},
): Record<string, unknown> | null {
  const schema = schemas[operationId];
  if (!schema) return null;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return null;
  const output = parsed.data as Record<string, unknown>;
  const binding: Record<string, string> = {
    schedule_ref: 'scheduleRef',
    draft_ref: 'draftRef',
    case_ref: 'caseRef',
  };
  for (const [key, value] of Object.entries(params)) {
    const target = binding[key];
    if (target) output[target] = value;
  }
  return output;
}
export const trainingCommandIds = new Set(Object.keys(schemas));
