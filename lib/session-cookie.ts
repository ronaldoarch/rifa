import type { NextResponse } from 'next/server'

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias

function cookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === 'true' || process.env.COOKIE_SECURE === '1') return true
  if (process.env.COOKIE_SECURE === 'false' || process.env.COOKIE_SECURE === '0') return false
  return process.env.NODE_ENV === 'production'
}

/** HTTPS: cookies com Secure (obrigatório em muitos browsers em site https). */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set('session', token, {
    httpOnly: true,
    path: '/',
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
    secure: cookieSecure(),
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set('session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: cookieSecure(),
  })
}
