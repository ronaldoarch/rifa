import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limit = rateLimit('register', request, 3, 60_000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas de cadastro. Tente novamente em 1 minuto.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetIn) } }
    )
  }
  try {
    const body = await request.json()
    const { cpf: cpfRaw, name, email, phone, password } = body

    const cpf = String(cpfRaw ?? '').replace(/\D/g, '')
    if (!cpf || cpf.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { cpf },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já cadastrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        cpf,
        name,
        email,
        phone,
        password: hashedPassword,
      },
    })

    // Create session
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}

