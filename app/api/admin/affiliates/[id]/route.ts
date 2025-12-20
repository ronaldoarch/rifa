import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()

    const affiliate = await prisma.affiliate.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.commissionRate !== undefined && {
          commissionRate: parseFloat(body.commissionRate),
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error('Error updating affiliate:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar afiliado' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await prisma.affiliate.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating affiliate:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar afiliado' },
      { status: 500 }
    )
  }
}

