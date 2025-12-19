import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?ref=${code}`

    const affiliate = await prisma.affiliate.create({
      data: {
        name,
        email,
        phone,
        commissionRate: commissionRate || 10,
        code,
        link,
      },
    })

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error('Affiliate creation error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar afiliado' },
      { status: 500 }
    )
  }
}

