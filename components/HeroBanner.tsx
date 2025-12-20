'use client'

import { useState } from 'react'
import PurchaseBox from './PurchaseBox'

export default function HeroBanner() {
  const [quantity, setQuantity] = useState(10)

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
          {/* Left side - Main content */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-yellow-400 mb-3 md:mb-4">
              5 MILHÕES
            </h1>
            <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
              <div className="h-1 w-8 sm:w-12 bg-yellow-400 mr-2 sm:mr-4"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                EM PRÊMIOS
              </h2>
              <div className="h-1 w-8 sm:w-12 bg-yellow-400 ml-2 sm:ml-4"></div>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8 px-2 sm:px-0">
              Acumule pontos, troque por vantagens e concorra a grandes prêmios
            </p>
          </div>

          {/* Right side - Purchase box */}
          <div className="flex justify-center md:justify-end">
            <PurchaseBox quantity={quantity} setQuantity={setQuantity} />
          </div>
        </div>
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

