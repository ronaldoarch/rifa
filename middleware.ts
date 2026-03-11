import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Proteção da página /admin: redireciona para /login se não tiver cookie de sessão
  // A verificação de role=admin é feita nas rotas /api/admin/* via requireAdmin
  const path = request.nextUrl.pathname
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

