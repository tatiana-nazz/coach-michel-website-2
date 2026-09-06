import { NextResponse } from 'next/server';
import { isSameAccessOrigin } from '@/platform/auth/request-boundary';

import {
  classifyProviderAuthFailure,
  validateCredentialSubmissionBody,
  type CredentialSubmissionStableCode,
} from '@/platform/auth/credential-submission';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';

const noStoreHeaders = {
  'Cache-Control': 'private, no-store',
} as const;

/**
 * P3-S12 remains a preserved reference-only contract in the Rev4385 transfer.
 * This adapter emits only the governed stable code needed by this P4-S08 slice
 * and adds no new detail code or provider disclosure.
 */
function stableErrorResponse(code: CredentialSubmissionStableCode, status: number) {
  return NextResponse.json(
    { error: { code } },
    {
      status,
      headers: noStoreHeaders,
    },
  );
}

function httpStatusForStableCode(code: CredentialSubmissionStableCode): number {
  switch (code) {
    case 'VALIDATION_FAILED':
      return 400;
    case 'AUTHENTICATION_REQUIRED_OR_INVALID':
      return 401;
    case 'RATE_LIMITED':
      return 429;
    case 'DEPENDENCY_UNAVAILABLE':
      return 503;
  }
}

export async function POST(request: Request) {
  if (!isSameAccessOrigin(request)) {
    return stableErrorResponse('VALIDATION_FAILED', 400);
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return stableErrorResponse('VALIDATION_FAILED', 400);
  }
  let rawBody: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return stableErrorResponse('VALIDATION_FAILED', 400);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16_384) {
        await reader.cancel();
        return stableErrorResponse('VALIDATION_FAILED', 400);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    rawBody = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return stableErrorResponse('VALIDATION_FAILED', httpStatusForStableCode('VALIDATION_FAILED'));
  }

  const parsed = validateCredentialSubmissionBody(rawBody);
  if (!parsed.ok) {
    return stableErrorResponse(parsed.code, httpStatusForStableCode(parsed.code));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.value.email,
      password: parsed.value.password,
    });

    if (error !== null) {
      const code = classifyProviderAuthFailure({
        ...(error.status === undefined ? {} : { status: error.status }),
        ...(error.code === undefined ? {} : { code: error.code }),
      });
      return stableErrorResponse(code, httpStatusForStableCode(code));
    }

    if (data.user?.id === undefined) {
      return stableErrorResponse(
        'DEPENDENCY_UNAVAILABLE',
        httpStatusForStableCode('DEPENDENCY_UNAVAILABLE'),
      );
    }

    return NextResponse.json(
      { status: 'authenticated' },
      {
        status: 200,
        headers: noStoreHeaders,
      },
    );
  } catch {
    return stableErrorResponse(
      'DEPENDENCY_UNAVAILABLE',
      httpStatusForStableCode('DEPENDENCY_UNAVAILABLE'),
    );
  }
}
