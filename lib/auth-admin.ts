import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Verifica se a requisição vem de um usuário admin autenticado.
 * Retorna NextResponse com 401 se não autorizado, ou null se OK.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  try {
    const token = request.cookies.get('session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
    }

    return null
  } catch (error) {
    console.error('requireAdmin error:', error)
    return NextResponse.json({ error: 'Erro ao verificar autenticação' }, { status: 500 })
  }
}
