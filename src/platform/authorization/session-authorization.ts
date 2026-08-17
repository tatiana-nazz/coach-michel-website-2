import type { SessionAdapter } from '../auth/session';
import type { AuthorizationDecision, AuthorizationPolicy } from './policy';

export interface SessionAuthorizationRequest {
  readonly action: string;
  readonly objectId?: string;
}

export class SessionAuthorizationService {
  constructor(
    private readonly session: SessionAdapter,
    private readonly policy: AuthorizationPolicy,
  ) {}

  async authorize(request: SessionAuthorizationRequest): Promise<AuthorizationDecision> {
    const state = await this.session.read();

    if (state.status === 'unknown') {
      return { allowed: false, reason: 'unknown' };
    }

    if (state.status === 'anonymous') {
      return { allowed: false, reason: 'unauthenticated' };
    }

    return this.policy.evaluate({
      subjectId: state.principal.subjectId,
      action: request.action,
      ...(request.objectId === undefined ? {} : { objectId: request.objectId }),
    });
  }
}
