import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Sempre dados frescos do Postgres (evita cache de CDN/Next em produção). */
export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_STORE = {
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
}

/** Valor salvo no banco (inclui string vazia); default só se a chave não existir. */
function cfg(map: Record<string, string>, key: string, defaultValue: string): string {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : defaultValue
}

/** Configurações públicas do site (nome da plataforma, etc.) */
export async function GET() {
  try {
    const configs = await prisma.config.findMany({
      where: {
        key: {
          in: [
            'PLATFORM_NAME',
            'WHATSAPP',
            'SCROLL_BANNER_TEXT',
            'PRIMARY_COLOR',
            'SECONDARY_COLOR',
            'TEXT_COLOR',
            'BACKGROUND_COLOR',
            'PRINCIPAL_RAFFLE_ID',
            'HERO_TITLE',
            'HERO_SUBTITLE',
            'HERO_DESCRIPTION',
            'LOGO_URL',
            'DAILY_PRIZES_SECTION_TITLE',
          ],
        },
      },
    })
    const map: Record<string, string> = {}
    configs.forEach((c) => {
      map[c.key] = c.value
    })
    const logoRaw = Object.prototype.hasOwnProperty.call(map, 'LOGO_URL')
      ? map.LOGO_URL?.trim() || null
      : null
    return NextResponse.json(
      {
        platformName: cfg(map, 'PLATFORM_NAME', 'PIX DO JONATHAN'),
        whatsapp: cfg(map, 'WHATSAPP', ''),
        scrollBannerText: cfg(map, 'SCROLL_BANNER_TEXT', 'CONCORRA A 10 MIL REAIS HOJE!'),
        primaryColor: map.PRIMARY_COLOR || '#FFD700',
        secondaryColor: map.SECONDARY_COLOR || '#2d5016',
        textColor: map.TEXT_COLOR || '#111827',
        backgroundColor: map.BACKGROUND_COLOR || '#ffffff',
        principalRaffleId: map.PRINCIPAL_RAFFLE_ID || null,
        heroTitle: cfg(map, 'HERO_TITLE', '5 MILHÕES'),
        heroSubtitle: cfg(map, 'HERO_SUBTITLE', 'EM PRÊMIOS'),
        heroDescription: cfg(
          map,
          'HERO_DESCRIPTION',
          'Acumule pontos, troque por vantagens e concorra a grandes prêmios'
        ),
        logoUrl: logoRaw,
        dailyPrizesSectionTitle: cfg(map, 'DAILY_PRIZES_SECTION_TITLE', 'Premios todos os dias'),
      },
      { headers: NO_STORE }
    )
  } catch (error) {
    console.error('Error fetching site config:', error)
    return NextResponse.json(
      {
        platformName: 'PIX DO JONATHAN',
        whatsapp: '',
        scrollBannerText: 'CONCORRA A 10 MIL REAIS HOJE!',
        primaryColor: '#FFD700',
        secondaryColor: '#2d5016',
        textColor: '#111827',
        backgroundColor: '#ffffff',
        principalRaffleId: null,
        heroTitle: '5 MILHÕES',
        heroSubtitle: 'EM PRÊMIOS',
        heroDescription: 'Acumule pontos, troque por vantagens e concorra a grandes prêmios',
        logoUrl: null,
        dailyPrizesSectionTitle: 'Premios todos os dias',
      },
      { status: 200, headers: NO_STORE }
    )
  }
}
