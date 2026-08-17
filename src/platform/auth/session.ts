export interface SessionPrincipal {
  readonly subjectId: string;
  readonly roleIds: readonly string[];
}

export type SessionState =
  | { readonly status: 'unknown' }
  | { readonly status: 'anonymous' }
  | { readonly status: 'authenticated'; readonly principal: SessionPrincipal };

export interface SessionAdapter {
  read(): Promise<SessionState>;
}

/**
 * Provider-neutral application session contract.
 * P4-S08 establishes the governed Supabase SSR cookie session at the application-server boundary;
 * role mapping and post-identity access-context resolution remain governed separately.
 */
