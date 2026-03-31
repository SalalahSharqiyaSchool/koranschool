import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated, getCurrentUser, hasRole } from './src/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/' || pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Protected routes
  if (!isAuthenticated()) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = getCurrentUser();
  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  if (pathname.startsWith('/teacher') && user?.role !== 'teacher') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
