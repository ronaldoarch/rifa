import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const { id } = await params
    await prisma.premiumNumber.delete({
      where: { id },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting premium number:', error)
    return NextResponse.json(
      { error: 'Erro ao remover bilhete premiado' },
      { status: 500 }
    )
  }
}
