/** Evita cache de browser/proxy ao ler textos/cores dinâmicos do site. */
export const SITE_CONFIG_REQUEST_INIT: RequestInit = { cache: 'no-store' }

export function fetchSiteConfigJson(): Promise<Response> {
  return fetch('/api/site-config', SITE_CONFIG_REQUEST_INIT)
}
