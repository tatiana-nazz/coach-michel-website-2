import { NextResponse } from 'next/server';
import { accessApplicationOrigin, isSameAccessOrigin } from '@/platform/auth/request-boundary';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
export async function POST(request: Request) {
  if (!isSameAccessOrigin(request))
    return NextResponse.json(
      { error: { code: 'AUTHORITY_DENIED' } },
      { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
    );
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signOut();
  if (error)
    return NextResponse.json(
      { error: { code: 'DEPENDENCY_UNAVAILABLE' } },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  const response = NextResponse.redirect(new URL('/access', accessApplicationOrigin(request)), 303);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
