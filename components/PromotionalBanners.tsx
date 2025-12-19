'use client'

import { useState } from 'react'
import PurchaseBox from './PurchaseBox'

export default function PromotionalBanners() {
  const [sextaQty, setSextaQty] = useState(24)
  const [tercaQty, setTercaQty] = useState(20)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Sexta da Alegria */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-2xl font-bold text-black mb-2">Sexta da Alegria</h3>
            <p className="text-gray-600 mb-4">Toda sexta-feira pontos que cabem no seu bolso</p>
            <div className="text-3xl font-bold text-green-600 mb-4">R$ 20.000</div>
            <div className="text-sm text-gray-500 mb-4">AS 21:00</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[5, 10, 15, 40, 100, 200].map((qty) => (
              <button
                key={qty}
                onClick={() => setSextaQty(qty)}
                className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                  sextaQty === qty
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                +{qty}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setSextaQty(Math.max(1, sextaQty - 1))}
              className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
            >
              -
            </button>
            <span className="text-xl font-bold">{sextaQty}</span>
            <button
              onClick={() => setSextaQty(sextaQty + 1)}
              className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-500 transition-colors">
            COMPRAR - R$ 6,00
          </button>
        </div>

        {/* Terça Premiada */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-2xl font-bold text-black mb-2">Terça Premiada</h3>
            <p className="text-gray-600 mb-4">Prêmios rápidos com chances que cabem no seu bolso</p>
            <div className="text-3xl font-bold text-green-600 mb-4">R$ 15.000</div>
            <div className="text-sm text-gray-500 mb-4">AS 21:00</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[10, 20, 30, 50, 80, 100].map((qty) => (
              <button
                key={qty}
                onClick={() => setTercaQty(qty)}
                className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                  tercaQty === qty
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                +{qty}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setTercaQty(Math.max(1, tercaQty - 1))}
              className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
            >
              -
            </button>
            <span className="text-xl font-bold">{tercaQty}</span>
            <button
              onClick={() => setTercaQty(tercaQty + 1)}
              className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-500 transition-colors">
            COMPRAR - R$ 4,00
          </button>
        </div>
      </div>
    </div>
  )
}

