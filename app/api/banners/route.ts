import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** API pública: lista banners ativos para exibir no site. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') // main, secondary, footer

    const where = { isActive: true }
    if (position) {
      (where as any).position = position
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching public banners:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar banners' },
      { status: 500 }
    )
  }
}
