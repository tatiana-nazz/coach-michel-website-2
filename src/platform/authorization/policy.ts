export type AuthorizationDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: 'unauthenticated' | 'forbidden' | 'unknown' };

export interface AuthorizationContext {
  readonly subjectId?: string;
  readonly objectId?: string;
  readonly action: string;
}

export interface AuthorizationPolicy {
  evaluate(context: AuthorizationContext): Promise<AuthorizationDecision>;
}

/** Concrete object-level policy rules remain governed by preserved contracts. */
