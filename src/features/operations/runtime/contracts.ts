export interface EvidenceSummary {
  summary: string;
  references: string[];
}

export interface IncidentSummary {
  incidentRef: string;
  classificationRef: string;
  affectedReferences: string[];
  status: string;
  evidence: EvidenceSummary;
  createdAt: string;
}

export interface RecoverySummary {
  recoveryActivityRef: string;
  status: string;
  category: string;
  reason: string;
  evidence: EvidenceSummary;
  startedAt: string;
}

export interface ValidationSummary {
  validationRef: string;
  result: string;
  evidence: EvidenceSummary;
  validatedAt: string;
}

export interface SupportCaseSummary {
  caseRef: string;
  requestCategory: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface IncidentContext {
  incident: IncidentSummary;
  activities: RecoverySummary[];
}

export interface ValidationContext {
  activity: RecoverySummary;
  incidentRef: string;
  canValidate: boolean;
  validations: ValidationSummary[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exact(value: unknown, keys: string[]): value is Record<string, unknown> {
  return record(value) && Object.keys(value).every((key) => keys.includes(key));
}

function text(value: unknown, max = 2000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

export function isOpaqueReference(value: unknown): value is string {
  return (
    text(value, 200) && !/[\u0000-\u001f\u007f]/u.test(value) && value !== '.' && value !== '..'
  );
}

function refs(value: unknown, required = false): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= 30 &&
    (!required || value.length > 0) &&
    value.every(isOpaqueReference) &&
    new Set(value).size === value.length
  );
}

function evidence(value: unknown, requiredReferences = false): boolean {
  return (
    exact(value, ['summary', 'references']) &&
    text(value.summary) &&
    refs(value.references, requiredReferences)
  );
}

/** Reject extra client authority fields. Actor, scope and independence come from the server. */
export function validateOperationsPayload(
  operationId: string,
  body: unknown,
): Record<string, unknown> | null {
  if (operationId === 'p3s11_apin_019_post_1') {
    if (
      !exact(body, ['requestCategory', 'minimumRoutingFacts', 'consentPurposeContext']) ||
      !['training', 'account', 'privacy', 'technical'].includes(String(body.requestCategory))
    )
      return null;
    if (!exact(body.minimumRoutingFacts, ['message']) || !text(body.minimumRoutingFacts.message))
      return null;
    if (
      !exact(body.consentPurposeContext, ['purpose']) ||
      body.consentPurposeContext.purpose !== 'support-request'
    )
      return null;
    return body;
  }
  if (operationId === 'p3s11_apin_039_patch_1') {
    return exact(body, ['status', 'expectedStatus', 'reason', 'evidence']) &&
      ['IN_REVIEW', 'ESCALATED', 'RESOLVED'].includes(String(body.status)) &&
      text(body.expectedStatus, 80) &&
      text(body.reason) &&
      refs(body.evidence, true)
      ? body
      : null;
  }
  if (operationId === 'p3s11_apin_040_intake') {
    return exact(body, ['classificationRef', 'affectedReferences', 'evidence']) &&
      ['availability', 'access', 'data-integrity', 'privacy', 'other'].includes(
        String(body.classificationRef),
      ) &&
      refs(body.affectedReferences) &&
      evidence(body.evidence)
      ? body
      : null;
  }
  if (operationId === 'p3s11_apin_041_post_1') {
    return exact(body, ['activityIntent', 'evidence']) &&
      exact(body.activityIntent, ['category', 'reason']) &&
      ['investigation', 'restoration', 'verification'].includes(
        String(body.activityIntent.category),
      ) &&
      text(body.activityIntent.reason) &&
      evidence(body.evidence, true)
      ? body
      : null;
  }
  if (operationId === 'p3s11_apin_042_submit_validation') {
    return exact(body, ['result', 'evidence']) &&
      ['PASS', 'FAIL', 'INCONCLUSIVE'].includes(String(body.result)) &&
      evidence(body.evidence, true)
      ? body
      : null;
  }
  if (operationId === 'p3s11_apin_043_post_1') {
    return exact(body, ['targetReferences', 'reason']) &&
      refs(body.targetReferences, true) &&
      text(body.reason)
      ? body
      : null;
  }
  return null;
}
