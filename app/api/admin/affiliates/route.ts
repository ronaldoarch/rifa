import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(affiliates)
  } catch (error) {
    console.error('Error fetching affiliates:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar afiliados' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, commissionRate } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Generate unique affiliate code
    const code = `AFF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const link = `${baseUrl}/?ref=${code}`

    const affiliate = await prisma.affiliate.create({
      data: {
        name,
        email,
        phone: phone || null,
        commissionRate: commissionRate ? parseFloat(commissionRate) : 10,
        code,
        link,
      },
    })

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error('Error creating affiliate:', error)
    return NextResponse.json(
      { error: 'Erro ao criar afiliado' },
      { status: 500 }
    )
  }
}

