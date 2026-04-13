'use client'

import { useState, useEffect } from 'react'
import { fetchSiteConfigJson } from '@/lib/site-config-fetch'

const DEFAULT_TEXT = 'CONCORRA A 10 MIL REAIS HOJE!'

export default function ScrollBanner() {
  /** null = a carregar; string vazia = admin limpou a faixa (não mostrar) */
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    fetchSiteConfigJson()
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.scrollBannerText === 'string') {
          setText(data.scrollBannerText.trim())
        } else {
          setText(DEFAULT_TEXT)
        }
      })
      .catch(() => setText(DEFAULT_TEXT))
  }, [])

  if (text === null || text === '') {
    return null
  }

  const repeatText = `${text} • `.repeat(10)

  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden">
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

