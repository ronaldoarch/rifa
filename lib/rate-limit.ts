/**
 * Rate limiting em memória (para single-instance).
 * Em produção com múltiplas instâncias, use Redis (ex: @upstash/ratelimit).
 */

const store = new Map<string, { count: number; resetAt: number }>()
const CLEANUP_INTERVAL = 60_000 // 1 min

function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return (forwarded?.split(',')[0]?.trim() || realIp || 'unknown').toLowerCase()
}

function cleanup() {
  const now = Date.now()
  for (const [key, data] of store.entries()) {
    if (data.resetAt < now) store.delete(key)
  }
}

let lastCleanup = Date.now()
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, CLEANUP_INTERVAL)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number
}

/**
 * Limita requisições por IP.
 * @param key - identificador (ex: "login", "register")
 * @param request - requisição para extrair IP
 * @param max - máximo de requisições na janela
 * @param windowMs - janela em ms (ex: 60000 = 1 min)
 */
export function rateLimit(
  key: string,
  request: Request,
  max: number,
  windowMs: number
): RateLimitResult {
  if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
    cleanup()
    lastCleanup = Date.now()
  }

  const clientId = getClientId(request)
  const storeKey = `${key}:${clientId}`
  const now = Date.now()
  let data = store.get(storeKey)

  if (!data || data.resetAt < now) {
    data = { count: 0, resetAt: now + windowMs }
    store.set(storeKey, data)
  }

  data.count++
  const remaining = Math.max(0, max - data.count)
  const allowed = data.count <= max

  return {
    allowed,
    remaining,
    resetIn: Math.max(0, Math.ceil((data.resetAt - now) / 1000)),
  }
}
