import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/** Redefine a senha usando o token recebido por e-mail. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = (body.token ?? '').toString().trim()
    const newPassword = (body.password ?? body.newPassword ?? '').toString()
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      )
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    })
    if (!reset || reset.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Link inválido ou expirado. Solicite um novo.' },
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: hash },
      }),
      prisma.passwordReset.delete({
        where: { id: reset.id },
      }),
    ])

    return NextResponse.json({ message: 'Senha alterada com sucesso. Faça login.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    )
  }
}
