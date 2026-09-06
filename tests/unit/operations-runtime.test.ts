import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { validateOperationsPayload } from '@/features/operations/runtime/contracts';
import type { ApiOperationContext } from '@/platform/server/contracts';

const { authorize, command } = vi.hoisted(() => ({ authorize: vi.fn(), command: vi.fn() }));
vi.mock('@/platform/server/boundary', () => ({
  authorizeOperation: authorize,
  executeCommand: command,
  apiError: (code: string, status: number) => Response.json({ error: { code } }, { status }),
  apiSuccess: (data: unknown) =>
    Response.json(data, { headers: { 'Cache-Control': 'private, no-store' } }),
}));
import {
  dispatchOperationsOperation,
  operationsListOptions,
  toIncident,
  toRecovery,
  toValidation,
} from '@/platform/server/operations-operations';

function context(operationId: string, body?: unknown): ApiOperationContext {
  return {
    operationId,
    request: new Request('https://cmh.example/operation'),
    user: { id: 'user-1' } as User,
    supabase: { from: vi.fn() } as unknown as SupabaseClient,
    body,
  };
}
const validEvidence = {
  summary: 'Verified against the retained evidence.',
  references: ['evidence-1'],
};

beforeEach(() => {
  vi.clearAllMocks();
  authorize.mockResolvedValue(null);
  command.mockResolvedValue(Response.json({ status: 'RECORDED' }));
});

describe('operations mutation boundary', () => {
  it('denies a caller before touching protected data or submitting a command', async () => {
    authorize.mockResolvedValue(
      Response.json({ error: { code: 'AUTHORITY_DENIED' } }, { status: 403 }),
    );
    const ctx = context('p3s11_apin_040_intake', {
      classificationRef: 'access',
      affectedReferences: [],
      evidence: validEvidence,
    });
    expect((await dispatchOperationsOperation(ctx))?.status).toBe(403);
    expect(ctx.supabase.from).not.toHaveBeenCalled();
    expect(command).not.toHaveBeenCalled();
  });

  it('takes the incident reference from the route and never accepts an actor assertion', async () => {
    const body = {
      activityIntent: {
        category: 'restoration',
        reason: 'Restoration completed using the approved runbook.',
      },
      evidence: validEvidence,
    };
    const ctx = {
      ...context('p3s11_apin_041_post_1', body),
      params: { incident_ref: 'incident-opaque' },
    };
    expect((await dispatchOperationsOperation(ctx))?.status).toBe(200);
    expect(command).toHaveBeenCalledWith(ctx, { ...body, incidentRef: 'incident-opaque' });
    command.mockClear();
    const forbidden = { ...ctx, body: { ...body, initiatedByPrincipalId: 'someone-else' } };
    expect((await dispatchOperationsOperation(forbidden))?.status).toBe(422);
    expect(command).not.toHaveBeenCalled();
  });

  it('cannot manufacture validation independence or bypass review with an empty evidence set', async () => {
    const operation = 'p3s11_apin_042_submit_validation';
    expect(
      validateOperationsPayload(operation, {
        result: 'PASS',
        evidence: validEvidence,
        independenceException: true,
      }),
    ).toBeNull();
    expect(
      validateOperationsPayload(operation, {
        result: 'PASS',
        evidence: { ...validEvidence, references: [] },
      }),
    ).toBeNull();
    const ctx = {
      ...context(operation, { result: 'PASS', evidence: validEvidence }),
      params: { recovery_activity_ref: 'activity-1' },
    };
    await dispatchOperationsOperation(ctx);
    expect(command).toHaveBeenCalledWith(ctx, {
      result: 'PASS',
      evidence: validEvidence,
      recoveryActivityRef: 'activity-1',
    });
  });

  it('rejects a client claim that a handoff already changed authoritative state', () => {
    const operation = 'p3s11_apin_043_post_1';
    expect(
      validateOperationsPayload(operation, {
        targetReferences: ['schedule-1'],
        reason: 'Review confirmed discrepancy.',
        completionStatus: 'COMPLETE',
      }),
    ).toBeNull();
    expect(
      validateOperationsPayload(operation, {
        targetReferences: ['schedule-1', 'schedule-1'],
        reason: 'Review confirmed discrepancy.',
      }),
    ).toBeNull();
  });

  it('bounds support intake and preserves purpose-limited request fields', () => {
    const body = {
      requestCategory: 'privacy',
      minimumRoutingFacts: { message: 'Please explain the information retained for my account.' },
      consentPurposeContext: { purpose: 'support-request' },
    };
    expect(validateOperationsPayload('p3s11_apin_019_post_1', body)).toEqual(body);
    expect(
      validateOperationsPayload('p3s11_apin_019_post_1', { ...body, principalId: 'other-person' }),
    ).toBeNull();
    expect(
      validateOperationsPayload('p3s11_apin_019_post_1', {
        ...body,
        minimumRoutingFacts: { message: 'x'.repeat(2001) },
      }),
    ).toBeNull();
  });
});

describe('operations reads', () => {
  it('projects only the declared operational context and omits internal actor identities', () => {
    const internal = {
      id: 'internal-id',
      initiated_by_principal_id: 'secret-actor',
      validator_principal_id: 'secret-validator',
      detected_by_principal_id: 'secret-detector',
      before_data: { private: true },
      evidence: { ...validEvidence, providerToken: 'secret' },
    };
    for (const dto of [toIncident(internal), toRecovery(internal), toValidation(internal)]) {
      expect(JSON.stringify(dto)).not.toMatch(/secret|internal-id|before_data|providerToken/);
      expect(dto.evidence).toEqual(validEvidence);
    }
  });

  it('rejects unbounded, negative or unknown collection filters', () => {
    expect(
      operationsListOptions(new Request('https://cmh.example/?limit=100&offset=50&status=OPEN')),
    ).toEqual({ limit: 100, offset: 50, status: 'OPEN' });
    for (const query of [
      'limit=10001',
      'offset=-1',
      'limit=1.5',
      'includePrivateData=true',
      'status=OPEN,RESOLVED',
    ]) {
      expect(operationsListOptions(new Request(`https://cmh.example/?${query}`))).toBeNull();
    }
  });
});
