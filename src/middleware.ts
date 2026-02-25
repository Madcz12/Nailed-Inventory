
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Public paths that don't satisfy the protection check
  const isPublicPath = path === '/login' || path === '/register' || path === '/forgot-password' || path.startsWith('/reset-password');

  const payload = session ? await decrypt(session) : null;

  // 1. Redirect to /login if accessing protected route without session
  if (!isPublicPath && !payload) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 2. Redirect to /dashboard if accessing login/register while authenticated
  if (isPublicPath && payload) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // 3. Admin-only routes protection (Example - expand as needed)
  if (path.startsWith('/dashboard/users') && payload?.role !== 'ADMIN') {
      // return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc.)
     */
    '/((?!api|static|.*\\..*|_next).*)',
  ],
};
