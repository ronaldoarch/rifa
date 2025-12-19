import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, name, email, phone, password } = body

    // Validate required fields
    if (!cpf || !name || !email || !password) {
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

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}

