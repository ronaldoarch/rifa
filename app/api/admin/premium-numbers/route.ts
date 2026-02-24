import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raffleId = searchParams.get('raffleId')

    const where = raffleId ? { raffleId } : {}

    const list = await prisma.premiumNumber.findMany({
      where,
      include: {
        raffle: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ raffleId: 'asc' }, { number: 'asc' }],
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching premium numbers:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bilhetes premiados' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { raffleId, number, prizeAmount } = body

    if (!raffleId || number === undefined || number === '' || prizeAmount == null) {
      return NextResponse.json(
        { error: 'Informe rifa, número do bilhete e valor da premiação' },
        { status: 400 }
      )
    }

    // Número do bilhete: 6 dígitos (000001 a 999999). Aceita "7" ou "000007"
    const parsed = parseInt(String(number).trim().replace(/\D/g, ''), 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 999999) {
      return NextResponse.json(
        { error: 'Número do bilhete inválido. Use um número de 1 a 999999 (6 dígitos).' },
        { status: 400 }
      )
    }
    const num = String(parsed)
    const amount = parseFloat(prizeAmount)
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'Valor da premiação inválido' },
        { status: 400 }
      )
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    })
    if (!raffle) {
      return NextResponse.json(
        { error: 'Rifa não encontrada' },
        { status: 404 }
      )
    }

    const created = await prisma.premiumNumber.create({
      data: {
        raffleId,
        number: num,
        prizeAmount: amount,
      },
      include: {
        raffle: {
          select: { id: true, title: true },
        },
      },
    })

    return NextResponse.json(created)
  } catch (error: unknown) {
    const e = error as { code?: string }
    if (e.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este número já está cadastrado como premiado nesta rifa' },
        { status: 400 }
      )
    }
    console.error('Error creating premium number:', error)
    return NextResponse.json(
      { error: 'Erro ao cadastrar bilhete premiado' },
      { status: 500 }
    )
  }
}
