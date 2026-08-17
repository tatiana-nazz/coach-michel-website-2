import { describe, expect, it } from 'vitest';

import {
  ESTABLISH_SESSION_OPERATION_ID,
  emptyOperationRegistry,
  operationRegistry,
} from '@/platform/api/operations';

describe('P4-S08 governed API operation registry', () => {
  it('binds only the governed SCR-ACC-001 credential-submission operation', () => {
    expect(operationRegistry.get(ESTABLISH_SESSION_OPERATION_ID)).toEqual({
      operationId: 'p3s11_scr_acc_001_establish_session_1',
      contractReference: 'ART-CMH-P3-S11-RL4382-SUPABASE-CREDENTIAL-SUBMISSION-REV4384-001',
      method: 'POST',
      path: '/access/session',
    });
  });

  it('preserves the scaffold-era empty registry export', () => {
    expect(emptyOperationRegistry.get(ESTABLISH_SESSION_OPERATION_ID)).toBeUndefined();
  });
});
