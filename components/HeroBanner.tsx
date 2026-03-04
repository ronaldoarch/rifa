'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PurchaseBox, { type PrincipalRaffle } from './PurchaseBox'

interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  position: string
  order: number
}

export default function HeroBanner() {
  const [quantity, setQuantity] = useState(10)
  const [principalRaffle, setPrincipalRaffle] = useState<PrincipalRaffle | null | undefined>(undefined)
  const [banners, setBanners] = useState<Banner[]>([])
  const [heroText, setHeroText] = useState({
    title: '5 MILHÕES',
    subtitle: 'EM PRÊMIOS',
    description: 'Acumule pontos, troque por vantagens e concorra a grandes prêmios',
  })

  useEffect(() => {
    fetch('/api/banners?position=main')
      .then((res) => res.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]))
  }, [])

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        setHeroText({
          title: data.heroTitle || '5 MILHÕES',
          subtitle: data.heroSubtitle || 'EM PRÊMIOS',
          description: data.heroDescription || 'Acumule pontos, troque por vantagens e concorra a grandes prêmios',
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/raffles/principal')
      .then((res) => res.json())
      .then((data) => {
        if (data?.id != null) {
          setPrincipalRaffle({
            id: data.id,
            ticketPrice: Number(data.ticketPrice),
            minPurchaseAmount: data.minPurchaseAmount != null ? Number(data.minPurchaseAmount) : null,
          })
        } else {
          setPrincipalRaffle(null)
        }
      })
      .catch(() => setPrincipalRaffle(null))
  }, [])

  useEffect(() => {
    if (principalRaffle == null) return
    const minPurchase = principalRaffle.minPurchaseAmount ?? 0
    const ticketPrice = principalRaffle.ticketPrice
    const minQty = ticketPrice > 0 && minPurchase > 0 ? Math.ceil(minPurchase / ticketPrice) : 1
    if (minQty > 1 && quantity < minQty) {
      setQuantity(minQty)
    }
  }, [principalRaffle, quantity])

  return (
    <div className="relative bg-gradient-to-b from-green-900 to-green-800 py-16 overflow-hidden">
      {/* Sparkle effect background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'sparkle 3s linear infinite'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left side - Texto com banner atrás (quando houver banner principal) */}
          <div
            className="relative text-center md:text-left rounded-xl overflow-hidden min-h-[320px] sm:min-h-[380px] md:min-h-[440px] flex flex-col justify-center py-12 md:py-16 px-6 md:px-8"
            style={
              banners.length > 0
                ? {
                    backgroundImage: `url(${banners[0].imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    imageRendering: 'auto',
                  }
                : undefined
            }
          >
            {banners.length > 0 && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-green-900/65 via-green-900/52 to-green-900/42"
                aria-hidden
              />
            )}
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-yellow-400 mb-3 md:mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {heroText.title}
              </h1>
              <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
                <div className="h-1 w-8 sm:w-12 bg-yellow-400 mr-2 sm:mr-4"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {heroText.subtitle}
                </h2>
                <div className="h-1 w-8 sm:w-12 bg-yellow-400 ml-2 sm:ml-4"></div>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8 px-2 sm:px-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                {heroText.description}
              </p>
            </div>
          </div>

          {/* Right side - Purchase box */}
          <div className="flex justify-center md:justify-end">
            <PurchaseBox quantity={quantity} setQuantity={setQuantity} principalRaffle={principalRaffle ?? undefined} />
          </div>
        </div>

        {/* Banners extras (do 2º em diante) em linha abaixo, se houver */}
        {banners.length > 1 && (
          <div className="mt-8 pt-8 border-t border-green-700/50">
            <div className="flex flex-wrap gap-4 justify-center items-stretch">
              {banners.slice(1).map((banner) => {
                const content = (
                  <div className="rounded-lg overflow-hidden shadow-lg border-2 border-green-600/30 bg-white/5 hover:border-yellow-400/50 transition-colors h-full flex flex-col">
                    <div className="relative aspect-video min-h-[120px] flex-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    {banner.title && (
                      <p className="text-white text-sm font-medium p-2 text-center truncate">
                        {banner.title}
                      </p>
                    )}
                  </div>
                )
                const className = 'block w-full max-w-[280px] sm:max-w-[320px] flex-1 min-w-[200px]'
                return banner.linkUrl ? (
                  <Link key={banner.id} href={banner.linkUrl} className={className} target="_blank" rel="noopener noreferrer">
                    {content}
                  </Link>
                ) : (
                  <div key={banner.id} className={className}>
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

