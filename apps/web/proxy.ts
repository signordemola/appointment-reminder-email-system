import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/confirm', '/reschedule']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) {
    return NextResponse.next()
  }

  // Redirect authenticated users away from login
  const session = request.cookies.get('rf_session')?.value
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)'],
}
