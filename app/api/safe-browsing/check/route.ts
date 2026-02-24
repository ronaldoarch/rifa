import { NextRequest, NextResponse } from 'next/server'

const SAFE_BROWSING_API = 'https://safebrowsing.googleapis.com/v4/threatMatches:find'
const MAX_URLS_PER_REQUEST = 10

/**
 * Verifica se uma ou mais URLs estão nas listas do Google Safe Browsing (malware, phishing, etc.).
 * Requer variável de ambiente GOOGLE_SAFE_BROWSING_API_KEY.
 * POST body: { urls: string[] }
 * Resposta: { safe: boolean, matches?: Array<{ url: string, threatType: string }> }
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: 'Safe Browsing não configurado (GOOGLE_SAFE_BROWSING_API_KEY)' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const urls = Array.isArray(body.urls) ? body.urls : [body.url].filter(Boolean)
    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'Envie pelo menos um URL em "urls" (array) ou "url" (string)' },
        { status: 400 }
      )
    }
    if (urls.length > MAX_URLS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Máximo ${MAX_URLS_PER_REQUEST} URLs por requisição` },
        { status: 400 }
      )
    }

    const threatEntries = urls.map((u: string) => ({ url: String(u).trim() })).filter((e: { url: string }) => e.url)

    const res = await fetch(`${SAFE_BROWSING_API}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: {
          clientId: 'rifa-platform',
          clientVersion: '1.0',
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries,
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Safe Browsing API error:', res.status, errText)
      return NextResponse.json(
        { error: 'Erro ao consultar Safe Browsing', details: res.status },
        { status: 502 }
      )
    }

    const data = await res.json()
    const matches = data.matches || []

    return NextResponse.json({
      safe: matches.length === 0,
      matches: matches.map((m: { threat?: { url?: string }; threatType?: string }) => ({
        url: m.threat?.url,
        threatType: m.threatType,
      })),
    })
  } catch (error) {
    console.error('Safe Browsing check error:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar URLs' },
      { status: 500 }
    )
  }
}
