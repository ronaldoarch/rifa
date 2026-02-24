import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Lista itens da seção "Prêmios todos os dias" para a página inicial */
export async function GET() {
  try {
    const items = await prisma.showcaseItem.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching showcase:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar itens' },
      { status: 500 }
    )
  }
}
