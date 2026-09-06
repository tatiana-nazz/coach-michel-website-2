import { type NextRequest, NextResponse } from 'next/server';
import { shouldRouteToApi } from '@/platform/api/route-matcher';
import { updateSession } from '@/platform/auth/update-session';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const needsSession =
    /^\/(?:access|workspace|trainee|coach|ops|api\/operations)(?:\/|$)/.test(pathname) ||
    shouldRouteToApi(request.method, pathname, request.headers.get('accept') ?? '');
  const session = needsSession ? await updateSession(request) : null;
  if (shouldRouteToApi(request.method, pathname, request.headers.get('accept') ?? '')) {
    const destination = request.nextUrl.clone();
    destination.pathname = `/api/operations${pathname}`;
    const response = NextResponse.rewrite(destination, {
      request: { headers: new Headers(request.headers) },
    });
    for (const cookie of session?.response.cookies.getAll() ?? []) response.cookies.set(cookie);
    response.headers.set('Cache-Control', 'private, no-store');
    for (const name of ['Expires', 'Pragma']) {
      const value = session?.response.headers.get(name);
      if (value) response.headers.set(name, value);
    }
    response.headers.set('Vary', 'Accept, Cookie');
    return response;
  }
  const response = session?.response ?? NextResponse.next();
  if (needsSession) {
    response.headers.set('Cache-Control', 'private, no-store');
    const vary = new Set(
      (response.headers.get('Vary') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );
    vary.add('Accept');
    vary.add('Cookie');
    response.headers.set('Vary', [...vary].join(', '));
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
