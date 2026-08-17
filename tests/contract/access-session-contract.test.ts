import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ESTABLISH_SESSION_OPERATION_ID, operationRegistry } from '@/platform/api/operations';

const route = readFileSync(
  fileURLToPath(new URL('../../src/app/access/session/route.ts', import.meta.url)),
  'utf8',
);

describe('P4-S08 SCR-ACC-001 session contract', () => {
  it('binds the governed operation id, method, path, and P3-S11 artifact', () => {
    expect(ESTABLISH_SESSION_OPERATION_ID).toBe('p3s11_scr_acc_001_establish_session_1');
    expect(operationRegistry.get(ESTABLISH_SESSION_OPERATION_ID)).toEqual({
      operationId: ESTABLISH_SESSION_OPERATION_ID,
      contractReference: 'ART-CMH-P3-S11-RL4382-SUPABASE-CREDENTIAL-SUBMISSION-REV4384-001',
      method: 'POST',
      path: '/access/session',
    });
  });

  it('delegates credential verification to Supabase Auth through the SSR server client', () => {
    expect(route).toContain('createSupabaseServerClient');
    expect(route).toContain('supabase.auth.signInWithPassword');
    expect(route).toContain('email: parsed.value.email');
    expect(route).toContain('password: parsed.value.password');
  });

  it('returns only the governed authenticated success body with non-cacheable semantics', () => {
    expect(route).toContain("{ status: 'authenticated' }");
    expect(route).toContain("'Cache-Control': 'private, no-store'");
    expect(route).not.toContain('accessToken');
    expect(route).not.toContain('refreshToken');
    expect(route).not.toContain('roleIds');
    expect(route).not.toContain('subjectId');
  });
});
