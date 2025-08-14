import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect all routes except auth pages and public assets
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow next internals and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Allow auth routes
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Allow public homepage
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Read JWT from cookie set on client after login
  const token = request.cookies.get('ol_jwt')?.value

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*).*)'],
}


