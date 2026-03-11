import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limit = rateLimit('login', request, 5, 60_000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetIn) } }
    )
  }
  try {
    const body = await request.json()
    const { cpf: cpfRaw, password } = body

    const cpf = String(cpfRaw ?? '').replace(/\D/g, '')
    if (!cpf || cpf.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }
    if (!password) {
      return NextResponse.json(
        { error: 'Senha obrigatória' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { cpf },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'CPF ou senha incorretos' },
        { status: 401 }
      )
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json(
        { error: 'CPF ou senha incorretos' },
        { status: 401 }
      )
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const cookie = `session=${token}; Path=/; HttpOnly; Max-Age=2592000; SameSite=Lax`
    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { headers: { 'Set-Cookie': cookie } }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
