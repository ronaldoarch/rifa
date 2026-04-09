import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { requireAdmin } from '@/lib/auth-admin'
import { UPLOAD_MAX_IMAGE_BYTES } from '@/lib/upload-limits'

const ALLOWED_TYPES = ['logo', 'banner', 'raffle', 'showcase'] as const
const MAX_SIZE_IMAGE = UPLOAD_MAX_IMAGE_BYTES
const MAX_SIZE_VIDEO = 80 * 1024 * 1024 // 80MB para vídeos da seção showcase
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime']

/** Uploads grandes (ex.: banner em alta resolução) em ambientes serverless lentos */
export const maxDuration = 120

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'banner'

    if (!file || !ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: 'Envie um arquivo e o tipo (logo, banner, raffle ou showcase)' },
        { status: 400 }
      )
    }

    const isVideo = ALLOWED_VIDEO_MIMES.includes(file.type)
    const isImage = ALLOWED_IMAGE_MIMES.includes(file.type)
    if (type === 'showcase') {
      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: 'Use imagem (JPEG, PNG, GIF, WebP) ou vídeo (MP4, WebM).' },
          { status: 400 }
        )
      }
    } else {
      if (!isImage) {
        return NextResponse.json(
          { error: 'Formato não permitido. Use JPEG, PNG, GIF ou WebP.' },
          { status: 400 }
        )
      }
    }

    const maxSize = type === 'showcase' && isVideo ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE
    if (file.size > maxSize) {
      const imgMb = Math.round(MAX_SIZE_IMAGE / 1024 / 1024)
      return NextResponse.json(
        {
          error: isVideo
            ? 'Vídeo muito grande. Máximo 80 MB.'
            : `Arquivo muito grande. Máximo ${imgMb} MB por imagem.`,
        },
        { status: 400 }
      )
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80)}`
    const dir = path.join(process.cwd(), 'public', 'uploads', type)
    await mkdir(dir, { recursive: true })
    const filePath = path.join(dir, safeName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const url = `/uploads/${type}/${safeName}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    )
  }
}
