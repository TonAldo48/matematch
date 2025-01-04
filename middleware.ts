import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that don't require authentication
const publicPaths = ['/signin']

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth')
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 