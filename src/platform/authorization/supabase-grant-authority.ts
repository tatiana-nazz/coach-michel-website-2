import { createSupabaseServerClient } from '@/platform/auth/supabase-server';

import type { GrantAuthority, GrantAuthorizationRequest } from './grant-authority';

interface GrantRpcResult {
  readonly data: boolean | null;
  readonly error: unknown | null;
}

interface GrantRpcClient {
  rpc(
    name: 'has_active_grant',
    args: {
      readonly requested_capability_id: string;
      readonly requested_resource_id: string;
      readonly requested_object_ref?: string;
      readonly requested_subject_ref?: string;
    },
  ): Promise<GrantRpcResult>;
}

type GrantRpcClientFactory = () => Promise<GrantRpcClient>;

const createGrantRpcClient: GrantRpcClientFactory = async () => {
  const supabase = await createSupabaseServerClient();

  return {
    rpc: async (name, args) => {
      const { data, error } = await supabase.rpc(name, args);
      return {
        data: data === true ? true : data === false ? false : null,
        error,
      };
    },
  };
};

export class SupabaseGrantAuthority implements GrantAuthority {
  constructor(private readonly createClient: GrantRpcClientFactory = createGrantRpcClient) {}

  async hasActiveGrant(request: GrantAuthorizationRequest): Promise<boolean> {
    try {
      const client = await this.createClient();
      const { data, error } = await client.rpc('has_active_grant', {
        requested_capability_id: request.capabilityId,
        requested_resource_id: request.resourceId,
        ...(request.objectRef === undefined ? {} : { requested_object_ref: request.objectRef }),
        ...(request.subjectRef === undefined ? {} : { requested_subject_ref: request.subjectRef }),
      });

      return error === null && data === true;
    } catch {
      return false;
    }
  }
}
