import { NextResponse } from 'next/server';
export function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'ar' ? 'ar' : 'en';
  const next = url.searchParams.get('next') ?? '/';
  const safeNext = /^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(next) ? next : '/';
  // A relative Location preserves the browser's public host behind a proxy.
  const response = new NextResponse(null, { status: 303, headers: { Location: safeNext } });
  response.cookies.set('cmh-locale', locale, {
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    path: '/',
    maxAge: 31536000,
  });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
