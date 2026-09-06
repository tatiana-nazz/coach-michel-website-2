import type { SupabaseClient, User } from '@supabase/supabase-js';

export interface ApiOperationContext {
  readonly operationId: string;
  readonly request: Request;
  readonly supabase: SupabaseClient;
  readonly user: User | null;
  readonly body?: unknown;
  readonly params?: Record<string, string>;
}
