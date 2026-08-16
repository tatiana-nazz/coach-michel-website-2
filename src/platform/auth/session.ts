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

/** No identity or session provider is selected in P4-S04. */
