import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-admin'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const configs = await prisma.config.findMany()
    const configMap: Record<string, string> = {}
    const SENSITIVE_KEYS = ['XGATE_PASSWORD', 'GATEBOX_PASSWORD', 'WEBHOOK_SECRET']

    configs.forEach((config) => {
      configMap[config.key] = SENSITIVE_KEYS.includes(config.key)
        ? (config.value ? '••••••••' : '')
        : config.value
    })

    return NextResponse.json(configMap)
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const body = await request.json()

    // Update or create config entries
    const updates = Object.entries(body).map(([key, value]) =>
      prisma.config.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}

