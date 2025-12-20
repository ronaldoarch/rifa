import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const params = await context.params
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { code: params.code },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    })

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Afiliado não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error('Affiliate fetch error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar afiliado' },
      { status: 500 }
    )
  }
}

