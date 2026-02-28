import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/** Gera token de redefinição e envia link por e-mail (ou retorna link em dev). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body.email ?? '').toString().trim().toLowerCase()
    if (!email) {
      return NextResponse.json(
        { error: 'Informe o e-mail' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return NextResponse.json(
        { message: 'Se o e-mail existir em nossa base, você receberá um link para redefinir a senha.' },
        { status: 200 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    })
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const resetLink = `${baseUrl}/redefinir-senha?token=${token}`

    // TODO: enviar e-mail com resetLink (nodemailer, Resend, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Link redefinir senha:', resetLink)
    }

    return NextResponse.json({
      message: 'Se o e-mail existir em nossa base, você receberá um link para redefinir a senha.',
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
