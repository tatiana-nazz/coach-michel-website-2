import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { operationRegistry } from '@/platform/api/operations';
import {
  governedProductionOperationIds,
  operationAuthorityDefinitions,
} from '@/platform/authorization/operation-authority';

const EXPECTED_AUTHORITY_SHA256 = '55c19c64d89a90314c23e2cd5dfd5c7525d4dda970d2e518d7922fdf6dc5ec61';

describe('P4-S06 production operation authority registry', () => {
  it('preserves the exact 56-operation authority compilation', () => {
    expect(governedProductionOperationIds).toHaveLength(56);
    expect(Object.keys(operationAuthorityDefinitions)).toHaveLength(56);

    const authorityHash = createHash('sha256')
      .update(JSON.stringify(operationAuthorityDefinitions))
      .digest('hex');

    expect(authorityHash).toBe(EXPECTED_AUTHORITY_SHA256);
  });

  it('stays synchronized with the production API operation registry', () => {
    for (const operationId of governedProductionOperationIds) {
      const authority = operationAuthorityDefinitions[operationId];
      const operation = operationRegistry.get(operationId);

      expect(operation, operationId).toBeDefined();
      expect(operation?.method, operationId).toBe(authority.method);
      expect(operation?.path, operationId).toBe(authority.path);
    }
  });

  it('keeps the scaffold-only session operation outside the production authority compilation', () => {
    expect(operationAuthorityDefinitions).not.toHaveProperty(
      'p3s11_scr_acc_001_establish_session_1',
    );
  });
});
