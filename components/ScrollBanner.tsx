'use client'

import { useSiteBootstrap } from '@/components/SiteBootstrapProvider'

export default function ScrollBanner() {
  const { scrollBannerText: text } = useSiteBootstrap()
  /** string vazia = admin limpou a faixa (não mostrar) */
  if (!text.trim()) {
    return null
  }

  const repeatText = `${text} • `.repeat(10)

  return (
    <div className="bg-site-primary text-gray-900 py-2 overflow-hidden">
      <div className="animate-scroll whitespace-nowrap">
        <span className="inline-block mr-8">{repeatText}</span>
        <span className="inline-block mr-8">{repeatText}</span>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

