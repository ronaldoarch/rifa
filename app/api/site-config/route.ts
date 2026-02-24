import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    return NextResponse.json({
      platformName: map.PLATFORM_NAME || 'PIX DO JONATHAN',
      whatsapp: map.WHATSAPP || '',
      scrollBannerText: map.SCROLL_BANNER_TEXT || 'CONCORRA A 10 MIL REAIS HOJE!',
      primaryColor: map.PRIMARY_COLOR || '#FFD700',
      secondaryColor: map.SECONDARY_COLOR || '#2d5016',
      textColor: map.TEXT_COLOR || '#111827',
      backgroundColor: map.BACKGROUND_COLOR || '#ffffff',
      principalRaffleId: map.PRINCIPAL_RAFFLE_ID || null,
      heroTitle: map.HERO_TITLE || '5 MILHÕES',
      heroSubtitle: map.HERO_SUBTITLE || 'EM PRÊMIOS',
      heroDescription: map.HERO_DESCRIPTION || 'Acumule pontos, troque por vantagens e concorra a grandes prêmios',
      logoUrl: map.LOGO_URL || null,
      dailyPrizesSectionTitle: map.DAILY_PRIZES_SECTION_TITLE || 'Premios todos os dias',
    })
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
      { status: 200 }
    )
  }
}
