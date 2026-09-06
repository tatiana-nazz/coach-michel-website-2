import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import { accessApplicationOrigin } from '@/platform/auth/request-boundary';
import { safeAccessRedirect } from '@/platform/auth/access-policy';

function finish(request: Request, path: string) {
  const response = NextResponse.redirect(new URL(path, accessApplicationOrigin(request)), 303);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  // Invite/recovery only: this application never initiates public self-registration.
  if (url.searchParams.has('error') || (!code && !tokenHash) || (code && tokenHash))
    return finish(request, '/access/error');
  try {
    const supabase = await createSupabaseServerClient();
    if (code && code.length <= 4096) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.user || data.user.is_anonymous) return finish(request, '/access/error');
      return finish(request, safeAccessRedirect(url.searchParams.get('next')));
    }
    if (tokenHash && tokenHash.length <= 4096 && (type === 'invite' || type === 'recovery')) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error || !data.user || data.user.is_anonymous) return finish(request, '/access/error');
      return finish(request, '/access/password');
    }
    return finish(request, '/access/error');
  } catch {
    return finish(request, '/access/error');
  }
}
