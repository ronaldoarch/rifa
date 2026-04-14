'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { fetchSiteConfigJson } from '@/lib/site-config-fetch'
import type { SiteBootstrap } from '@/lib/site-bootstrap'

const SiteBootstrapContext = createContext<SiteBootstrap | null>(null)

function parseSiteConfig(data: Record<string, unknown>, fallback: SiteBootstrap): SiteBootstrap {
  return {
    platformName:
      typeof data.platformName === 'string' && data.platformName.trim()
        ? data.platformName.trim()
        : fallback.platformName,
    logoUrl:
      typeof data.logoUrl === 'string' && data.logoUrl.trim() ? data.logoUrl.trim() : null,
    scrollBannerText:
      typeof data.scrollBannerText === 'string'
        ? data.scrollBannerText.trim()
        : fallback.scrollBannerText,
  }
}

/** Disparar após salvar em Admin → Configurações para atualizar header/footer sem F5. */
export function notifySiteConfigUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('site-config-updated'))
  }
}

export function SiteBootstrapProvider({
  children,
  value,
}: {
  children: ReactNode
  value: SiteBootstrap
}) {
  const [config, setConfig] = useState<SiteBootstrap>(value)

  useEffect(() => {
    const onUpdate = () => {
      fetchSiteConfigJson()
        .then((res) => res.json())
        .then((data) =>
          setConfig((prev) => parseSiteConfig(data as Record<string, unknown>, prev))
        )
        .catch(() => {})
    }
    window.addEventListener('site-config-updated', onUpdate)
    return () => window.removeEventListener('site-config-updated', onUpdate)
  }, [])

  return (
    <SiteBootstrapContext.Provider value={config}>{children}</SiteBootstrapContext.Provider>
  )
}

export function useSiteBootstrap(): SiteBootstrap {
  const ctx = useContext(SiteBootstrapContext)
  if (!ctx) {
    throw new Error('useSiteBootstrap deve ser usado dentro de SiteBootstrapProvider')
  }
  return ctx
}
