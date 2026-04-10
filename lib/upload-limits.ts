/** Limites alinhados com `app/api/upload/route.ts` (imagens banner, logo, rifa). */
export const UPLOAD_MAX_IMAGE_BYTES = 32 * 1024 * 1024 // 32MB (logos/banners em alta resolução)
export const UPLOAD_MAX_IMAGE_MB = Math.round(UPLOAD_MAX_IMAGE_BYTES / 1024 / 1024)

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const

export function validateClientImageUpload(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'Use JPEG, PNG, GIF ou WebP.'
  }
  if (file.size > UPLOAD_MAX_IMAGE_BYTES) {
    return `Arquivo muito grande. Máximo ${UPLOAD_MAX_IMAGE_MB} MB por imagem.`
  }
  return null
}

export const UPLOAD_MAX_VIDEO_BYTES = 80 * 1024 * 1024

const SHOWCASE_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const

/** Showcase: imagem (mesmo limite do banner) ou vídeo até 80 MB. */
export function validateClientShowcaseFile(file: File): string | null {
  if (file.type.startsWith('video/')) {
    if (!SHOWCASE_VIDEO_TYPES.includes(file.type as (typeof SHOWCASE_VIDEO_TYPES)[number])) {
      return 'Vídeo: use MP4, WebM ou QuickTime (.mov).'
    }
    if (file.size > UPLOAD_MAX_VIDEO_BYTES) {
      return 'Vídeo muito grande. Máximo 80 MB.'
    }
    return null
  }
  return validateClientImageUpload(file)
}
