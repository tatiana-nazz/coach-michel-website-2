import { describe, expect, it } from 'vitest';

import type { SessionAdapter, SessionState } from '@/platform/auth/session';
import type {
  AuthorizationContext,
  AuthorizationPolicy,
} from '@/platform/authorization/policy';
import { SessionAuthorizationService } from '@/platform/authorization/session-authorization';

function createSessionAdapter(state: SessionState): SessionAdapter {
  return {
    read: () => Promise.resolve(state),
  };
}

function policyThatMustNotRun(): AuthorizationPolicy {
  return {
    evaluate: () => Promise.reject(new Error('authorization policy must not run')),
  };
}

describe('SessionAuthorizationService', () => {
  it('returns unknown while session state is unresolved without evaluating policy', async () => {
    const service = new SessionAuthorizationService(
      createSessionAdapter({ status: 'unknown' }),
      policyThatMustNotRun(),
    );

    await expect(service.authorize({ action: 'profile:read' })).resolves.toEqual({
      allowed: false,
      reason: 'unknown',
    });
  });

  it('returns unauthenticated for an anonymous session without evaluating policy', async () => {
    const service = new SessionAuthorizationService(
      createSessionAdapter({ status: 'anonymous' }),
      policyThatMustNotRun(),
    );

    await expect(service.authorize({ action: 'profile:read' })).resolves.toEqual({
      allowed: false,
      reason: 'unauthenticated',
    });
  });

  it('delegates authenticated subject, action and object context to the policy', async () => {
    let receivedContext: AuthorizationContext | undefined;
    const policy: AuthorizationPolicy = {
      evaluate: (context) => {
        receivedContext = context;
        return Promise.resolve({ allowed: true });
      },
    };
    const service = new SessionAuthorizationService(
      createSessionAdapter({
        status: 'authenticated',
        principal: { subjectId: 'subject-1', roleIds: ['coach'] },
      }),
      policy,
    );

    await expect(
      service.authorize({ action: 'trainee:read', objectId: 'trainee-1' }),
    ).resolves.toEqual({ allowed: true });
    expect(receivedContext).toEqual({
      subjectId: 'subject-1',
      action: 'trainee:read',
      objectId: 'trainee-1',
    });
  });
});
