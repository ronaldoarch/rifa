import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10) || 20))
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { cpf: { contains: search } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          cpf: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          credits: true,
          affiliateId: true,
          referredBy: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              tickets: true,
              payments: true,
            },
          },
          affiliate: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}

