import { NextResponse } from 'next/server'

const SAFE_BROWSING_API = 'https://safebrowsing.googleapis.com/v4/threatMatches:find'
const CACHE_MS = 5 * 60 * 1000 // 5 minutos

let cached: { safe: boolean; at: number } | null = null

/**
 * Retorna se o site está verificado como seguro pelo Google Safe Browsing.
 * GET - usa a URL do site (SITE_URL ou origem) e cache em memória.
 * Resposta: { safe: boolean | null, checked: boolean }
 * - safe: true = site não está em listas de ameaça; false = está; null = não foi possível verificar
 * - checked: true = consulta foi feita (com ou sem API key)
 */
export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY?.trim()
  const siteUrl = process.env.SITE_URL || request.headers.get('origin') || ''

  if (!siteUrl) {
    return NextResponse.json({ safe: null, checked: false })
  }

  // URL precisa ser completa para a API
  const urlToCheck = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`

  if (!apiKey) {
    return NextResponse.json({ safe: null, checked: false })
  }

  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json({ safe: cached.safe, checked: true })
  }

  try {
    const res = await fetch(`${SAFE_BROWSING_API}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'rifa-platform', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: urlToCheck }],
        },
      }),
    })

    if (!res.ok) {
      cached = null
      return NextResponse.json({ safe: null, checked: false })
    }

    const data = await res.json()
    const safe = !data.matches || data.matches.length === 0
    cached = { safe, at: Date.now() }
    return NextResponse.json({ safe, checked: true })
  } catch {
    return NextResponse.json({ safe: null, checked: false })
  }
}
