'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ShowcaseItem {
  id: string
  mediaType: string
  mediaUrl: string
  name: string
  prize: string
  order: number
}

export default function WinnersSection() {
  const [sectionTitle, setSectionTitle] = useState('Premios todos os dias')
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/site-config').then((r) => r.json()),
      fetch('/api/showcase').then((r) => r.json()),
    ])
      .then(([config, list]) => {
        setSectionTitle(config.dailyPrizesSectionTitle || 'Premios todos os dias')
        setItems(Array.isArray(list) ? list : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-gray-50 py-8 sm:py-12 text-gray-900">
      <div className="container mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-900">
          {sectionTitle}
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Em breve, prêmios todos os dias aqui.
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-3 sm:gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="w-[100px] sm:w-[130px] flex flex-col rounded-xl sm:rounded-2xl border-4 sm:border-[6px] border-blue-900 shadow-lg overflow-hidden bg-blue-900"
              >
                <div className="bg-blue-900 text-white text-center py-1 px-1 text-[10px] sm:text-xs font-bold uppercase leading-tight">
                  Ganhou {item.prize}
                </div>
                <div className="w-full aspect-[9/16] bg-gray-900 flex items-center justify-center overflow-hidden">
                  {item.mediaType === 'video' ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : item.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.mediaUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="bg-blue-900 text-white text-center py-1 px-1 text-[10px] sm:text-xs font-semibold truncate" title={item.name}>
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/resultados" className="text-green-700 hover:text-green-800 font-semibold">
            ver mais →
          </Link>
        </div>
      </div>
    </div>
  )
}
