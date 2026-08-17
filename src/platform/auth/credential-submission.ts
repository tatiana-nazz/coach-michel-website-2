export const credentialSubmissionStableCodes = [
  'VALIDATION_FAILED',
  'AUTHENTICATION_REQUIRED_OR_INVALID',
  'DEPENDENCY_UNAVAILABLE',
  'RATE_LIMITED',
] as const;

export type CredentialSubmissionStableCode = (typeof credentialSubmissionStableCodes)[number];

export interface CredentialSubmissionBody {
  readonly email: string;
  readonly password: string;
}

export type CredentialSubmissionValidation =
  | { readonly ok: true; readonly value: CredentialSubmissionBody }
  | { readonly ok: false; readonly code: 'VALIDATION_FAILED' };

export interface ProviderAuthFailure {
  readonly status?: number;
  readonly code?: string;
}

export function validateCredentialSubmissionBody(body: unknown): CredentialSubmissionValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, code: 'VALIDATION_FAILED' };
  }

  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);
  if (
    keys.length !== 2 ||
    !keys.includes('email') ||
    !keys.includes('password') ||
    typeof record.email !== 'string' ||
    record.email.length === 0 ||
    typeof record.password !== 'string' ||
    record.password.length === 0
  ) {
    return { ok: false, code: 'VALIDATION_FAILED' };
  }

  return {
    ok: true,
    value: {
      email: record.email,
      password: record.password,
    },
  };
}

export function classifyProviderAuthFailure(
  error: ProviderAuthFailure,
): Exclude<CredentialSubmissionStableCode, 'VALIDATION_FAILED'> {
  const normalizedCode = error.code?.toLowerCase();

  if (error.status === 429 || normalizedCode?.includes('rate_limit') === true) {
    return 'RATE_LIMITED';
  }

  if (
    error.status === 400 ||
    error.status === 401 ||
    normalizedCode === 'invalid_credentials' ||
    normalizedCode === 'email_not_confirmed'
  ) {
    return 'AUTHENTICATION_REQUIRED_OR_INVALID';
  }

  return 'DEPENDENCY_UNAVAILABLE';
}
