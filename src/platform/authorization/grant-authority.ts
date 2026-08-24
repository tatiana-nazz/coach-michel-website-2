import type { GovernedCapabilityId, GovernedResourceId } from './scoped-policy';

export interface GrantAuthorizationRequest {
  readonly capabilityId: GovernedCapabilityId;
  readonly resourceId: GovernedResourceId;
  readonly objectRef?: string;
  readonly subjectRef?: string;
}

export interface GrantAuthority {
  hasActiveGrant(request: GrantAuthorizationRequest): Promise<boolean>;
}
