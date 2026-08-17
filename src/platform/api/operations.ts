export type ApiOperationMethod = 'GET' | 'POST';

export interface OperationDescriptor {
  readonly operationId: string;
  readonly contractReference: string;
  readonly method?: ApiOperationMethod;
  readonly path?: string;
}

export interface OperationRegistry {
  get(operationId: string): OperationDescriptor | undefined;
}

export const ESTABLISH_SESSION_OPERATION_ID = 'p3s11_scr_acc_001_establish_session_1';

const operationDescriptors = new Map<string, OperationDescriptor>([
  [
    ESTABLISH_SESSION_OPERATION_ID,
    {
      operationId: ESTABLISH_SESSION_OPERATION_ID,
      contractReference: 'ART-CMH-P3-S11-RL4382-SUPABASE-CREDENTIAL-SUBMISSION-REV4384-001',
      method: 'POST',
      path: '/access/session',
    },
  ],
]);

export const operationRegistry: OperationRegistry = {
  get: (operationId) => operationDescriptors.get(operationId),
};

/** Preserved empty registry for scaffold-era consumers that explicitly require no production operations. */
export const emptyOperationRegistry: OperationRegistry = {
  get: () => undefined,
};
