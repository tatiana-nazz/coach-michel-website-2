import { describe, expect, it } from 'vitest';

import {
  classifyProviderAuthFailure,
  validateCredentialSubmissionBody,
} from '@/platform/auth/credential-submission';

describe('P4-S08 credential submission boundary', () => {
  it('accepts exactly email and password without normalizing the password', () => {
    const password = '  exact user secret  ';
    const result = validateCredentialSubmissionBody({
      email: 'trainee@example.com',
      password,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        email: 'trainee@example.com',
        password,
      },
    });
  });

  it('rejects missing, malformed, empty, or authority-bearing request fields', () => {
    expect(validateCredentialSubmissionBody(null)).toEqual({
      ok: false,
      code: 'VALIDATION_FAILED',
    });
    expect(validateCredentialSubmissionBody({ email: '', password: 'secret' })).toEqual({
      ok: false,
      code: 'VALIDATION_FAILED',
    });
    expect(
      validateCredentialSubmissionBody({
        email: 'trainee@example.com',
        password: 'secret',
        subjectId: 'client-asserted',
      }),
    ).toEqual({
      ok: false,
      code: 'VALIDATION_FAILED',
    });
  });

  it('maps provider credential failures without disclosing account existence', () => {
    expect(classifyProviderAuthFailure({ status: 400, code: 'invalid_credentials' })).toBe(
      'AUTHENTICATION_REQUIRED_OR_INVALID',
    );
    expect(classifyProviderAuthFailure({ status: 401 })).toBe(
      'AUTHENTICATION_REQUIRED_OR_INVALID',
    );
  });

  it('maps provider rate limits and transient failures to governed stable codes', () => {
    expect(classifyProviderAuthFailure({ status: 429 })).toBe('RATE_LIMITED');
    expect(classifyProviderAuthFailure({ code: 'over_request_rate_limit' })).toBe('RATE_LIMITED');
    expect(classifyProviderAuthFailure({ status: 500 })).toBe('DEPENDENCY_UNAVAILABLE');
  });
});
