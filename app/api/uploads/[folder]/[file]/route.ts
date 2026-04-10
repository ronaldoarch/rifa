import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const FOLDERS = ['logo', 'banner', 'raffle', 'showcase'] as const

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
}

/** Nome do ficheiro após upload: timestamp + caracteres seguros (sem path). */
const SAFE_FILE = /^[a-zA-Z0-9._-]+$/

/**
 * Serve ficheiros em public/uploads (logo, banner, rifa, showcase).
 * Usado via rewrite de /uploads/:folder/:file → esta rota, para o mesmo URL continuar a funcionar
 * com output standalone e volume persistente em public/uploads.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ folder: string; file: string }> }
) {
  const { folder, file } = await context.params
  if (!FOLDERS.includes(folder as (typeof FOLDERS)[number]) || !SAFE_FILE.test(file)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const base = path.resolve(process.cwd(), 'public', 'uploads', folder)
  const filePath = path.resolve(base, file)
  const rel = path.relative(base, filePath)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const buf = await readFile(filePath)
    const ext = path.extname(file).toLowerCase()
    const contentType = MIME[ext] || 'application/octet-stream'
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
