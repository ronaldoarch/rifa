import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export type SiteBootstrap = {
  platformName: string
  logoUrl: string | null
  scrollBannerText: string
}

const CONFIG_KEYS = ['PLATFORM_NAME', 'LOGO_URL', 'SCROLL_BANNER_TEXT'] as const

function mapFromRows(rows: { key: string; value: string }[]): Record<string, string> {
  const m: Record<string, string> = {}
  for (const r of rows) m[r.key] = r.value
  return m
}

/**
 * Valores públicos do site para o 1.º render (sem flash de placeholders).
 * Deduplicado por pedido com `cache` (React / Next).
 */
export const getSiteBootstrap = cache(async (): Promise<SiteBootstrap> => {
  try {
    const rows = await prisma.config.findMany({
      where: { key: { in: [...CONFIG_KEYS] } },
    })
    const map = mapFromRows(rows)
    const platformName = map.PLATFORM_NAME?.trim() || 'PIX DO JONATHAN'
    const rawLogo = map.LOGO_URL?.trim()
    const logoUrl = rawLogo || null
    const scrollBannerText =
      map.SCROLL_BANNER_TEXT !== undefined
        ? map.SCROLL_BANNER_TEXT.trim()
        : 'CONCORRA A 10 MIL REAIS HOJE!'
    return { platformName, logoUrl, scrollBannerText }
  } catch {
    return {
      platformName: 'PIX DO JONATHAN',
      logoUrl: null,
      scrollBannerText: 'CONCORRA A 10 MIL REAIS HOJE!',
    }
  }
})
