import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { setSessionCookie } from '@/lib/session-cookie'

const SSO_SECRET = process.env.SSO_SECRET || process.env.JWT_SECRET

export async function POST(request: NextRequest) {
  const limit = rateLimit('sso', request, 10, 60_000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetIn) } }
    )
  }

  if (!SSO_SECRET) {
    return NextResponse.json(
      { error: 'SSO não configurado' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { token } = body
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token SSO não fornecido' },
        { status: 400 }
      )
    }

    const decoded = jwt.verify(token, SSO_SECRET) as {
      id: number
      email: string
      nome: string
      cpf?: string | null
    }

    const email = decoded.email?.trim()
    if (!email) {
      return NextResponse.json(
        { error: 'Token SSO inválido: email ausente' },
        { status: 400 }
      )
    }
    const cpfClean = decoded.cpf ? String(decoded.cpf).replace(/\D/g, '') : null

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(cpfClean && cpfClean.length === 11 ? [{ cpf: cpfClean }] : []),
        ],
      },
    })

    if (!user) {
      if (!cpfClean || cpfClean.length !== 11) {
        return NextResponse.json(
          { error: 'Complete seu cadastro na Rifa informando seu CPF no Jogo do Bicho.' },
          { status: 400 }
        )
      }
      user = await prisma.user.create({
        data: {
          cpf: cpfClean,
          name: decoded.nome || 'Usuário',
          email,
          password: null,
        },
      })
    }

    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    })

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ?? 'user',
      },
    })
    setSessionCookie(res, sessionToken)
    return res
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token SSO inválido ou expirado' },
        { status: 401 }
      )
    }
    const err = error as { code?: string; message?: string; meta?: unknown }
    console.error('SSO error:', error)
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Usuário já existe com outro cadastro. Faça login manualmente.' },
        { status: 400 }
      )
    }
    if (err.code === 'P2021') {
      return NextResponse.json(
        { error: 'Tabela não encontrada. Execute: npx prisma db push' },
        { status: 500 }
      )
    }
    const msg = process.env.NODE_ENV === 'development' && err.message
      ? String(err.message)
      : 'Erro ao fazer login via SSO'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
