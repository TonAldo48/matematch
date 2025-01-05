import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const publicPaths = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth');
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // If the path is public (signin/signup), allow access regardless of authentication
  if (isPublicPath) {
    // Only redirect to home if authenticated
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // For all other paths, require authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};