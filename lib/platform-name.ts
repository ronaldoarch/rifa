import { getSiteBootstrap } from '@/lib/site-bootstrap'

/** Nome comercial (Config → Nome da plataforma). Usa cache de `getSiteBootstrap`. */
export async function getPlatformName(): Promise<string> {
  const b = await getSiteBootstrap()
  return b.platformName
}
