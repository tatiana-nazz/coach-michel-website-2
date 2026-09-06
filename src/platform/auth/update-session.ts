import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/** Refresh once before rendering; callers must preserve response cookies on rewrites. */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
  available: boolean;
}> {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { response, user: null, available: false };
  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          const previousCookies = response.cookies.getAll();
          response = NextResponse.next({ request });
          for (const cookie of previousCookies) response.cookies.set(cookie);
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
          response.headers.set('Cache-Control', 'private, no-store');
        },
      },
    });
    // getUser verifies with Auth, including disabled/deleted users; getSession is not authority.
    const { data, error } = await supabase.auth.getUser();
    return {
      response,
      user: error ? null : data.user,
      available:
        !error ||
        error.status === 400 ||
        error.status === 401 ||
        error.name === 'AuthSessionMissingError',
    };
  } catch {
    return { response, user: null, available: false };
  }
}
