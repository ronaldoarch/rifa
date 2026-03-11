import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const winners = await prisma.winner.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(winners)
  } catch (error) {
    console.error('Error fetching winners:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar ganhadores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const body = await request.json()
    const {
      userId,
      raffleId,
      ticketId,
      prizeAmount,
      videoUrl,
      testimonial,
      isVerified,
    } = body

    if (!userId || !raffleId || !ticketId || !prizeAmount) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const winner = await prisma.winner.create({
      data: {
        userId,
        raffleId,
        ticketId,
        prizeAmount: parseFloat(prizeAmount),
        videoUrl: videoUrl || null,
        testimonial: testimonial || null,
        isVerified: isVerified !== undefined ? isVerified : false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        raffle: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json(winner)
  } catch (error) {
    console.error('Error creating winner:', error)
    return NextResponse.json(
      { error: 'Erro ao criar ganhador' },
      { status: 500 }
    )
  }
}

