import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

/** PWA: ícones e nome vêm do Config (mesmo logo do site), não dos PNG estáticos antigos. */
export const dynamic = 'force-dynamic'

function iconTypeFromUrl(url: string): string {
  const u = url.toLowerCase().split('?')[0]
  if (u.endsWith('.png')) return 'image/png'
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg'
  if (u.endsWith('.webp')) return 'image/webp'
  if (u.endsWith('.svg')) return 'image/svg+xml'
  return 'image/png'
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let platformName = 'PIX DO JONATHAN'
  let logoUrl: string | null = null
  let themeColor = '#FFD700'

  try {
    const configs = await prisma.config.findMany({
      where: {
        key: { in: ['PLATFORM_NAME', 'LOGO_URL', 'PRIMARY_COLOR'] },
      },
    })
    const map = Object.fromEntries(configs.map((c) => [c.key, c.value]))
    if (map.PLATFORM_NAME?.trim()) platformName = map.PLATFORM_NAME.trim()
    if (map.LOGO_URL?.trim()) logoUrl = map.LOGO_URL.trim()
    if (map.PRIMARY_COLOR?.trim()) themeColor = map.PRIMARY_COLOR.trim()
  } catch {
    // build sem DB ou falha: fallback estático
  }

  const shortName =
    platformName.length > 12 ? platformName.slice(0, 12) : platformName

  const useDynamicLogo = Boolean(logoUrl)
  const iconType = useDynamicLogo ? iconTypeFromUrl(logoUrl!) : 'image/png'

  const icons: MetadataRoute.Manifest['icons'] = useDynamicLogo
    ? [
        {
          src: logoUrl!,
          sizes: '192x192',
          type: iconType,
          purpose: 'any',
        },
        {
          src: logoUrl!,
          sizes: '512x512',
          type: iconType,
          purpose: 'any',
        },
      ]
    : [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
      ]

  return {
    name: platformName,
    short_name: shortName,
    description: 'Acumule pontos, troque por vantagens e concorra a grandes prêmios',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColor,
    orientation: 'portrait-primary',
    icons,
  }
}
