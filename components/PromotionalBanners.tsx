'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Raffle {
  id: string
  title: string
  description: string | null
  prizeAmount: number
  status: string
  startDate: string
  endDate: string | null
  totalTickets: number
  soldTickets: number
  ticketPrice: number
  minPurchaseAmount?: number | null
  imageUrl: string | null
}

const QUICK_QUANTITIES = [5, 10, 15, 20, 50, 100]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function PromotionalBanners() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchRaffles() {
      try {
        const res = await fetch('/api/raffles')
        const data = await res.json()
        if (Array.isArray(data)) {
          setRaffles(data)
          const initial: Record<string, number> = {}
          data.forEach((r: Raffle) => {
            const min = (r.minPurchaseAmount && r.minPurchaseAmount > 0 && r.ticketPrice > 0)
              ? Math.ceil(r.minPurchaseAmount / r.ticketPrice)
              : 1
            initial[r.id] = Math.max(10, min)
          })
          setQuantities(initial)
        }
      } catch (e) {
        console.error('Error fetching raffles:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchRaffles()
  }, [])

  const getMinQuantity = (raffle: Raffle) => {
    if (raffle.minPurchaseAmount && raffle.minPurchaseAmount > 0 && raffle.ticketPrice > 0) {
      return Math.ceil(raffle.minPurchaseAmount / raffle.ticketPrice)
    }
    return 1
  }

  const setQuantity = (raffle: Raffle, qty: number) => {
    const minQty = getMinQuantity(raffle)
    setQuantities((prev) => ({ ...prev, [raffle.id]: Math.max(minQty, qty) }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      </div>
    )
  }

  if (raffles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <p className="text-center text-gray-500">Nenhuma rifa ativa no momento.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="bg-green-700 text-white py-3 px-4 rounded-t-lg mb-0">
        <h2 className="text-xl font-bold">prêmios</h2>
      </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-6">
        {raffles.map((raffle) => {
          const minQty = getMinQuantity(raffle)
          const qty = Math.max(minQty, quantities[raffle.id] ?? minQty)
          const totalPrice = raffle.ticketPrice * qty
          const buyHref = `/comprar?raffleId=${encodeURIComponent(raffle.id)}&quantity=${qty}`

          return (
            <div
              key={raffle.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 shadow-lg text-gray-900"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-2">🎉</div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">{raffle.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2">
                  {raffle.description || 'Participe e concorra a prêmios.'}
                </p>
                <div className="text-2xl sm:text-3xl font-bold text-green-700 mb-3 sm:mb-4">
                  {formatCurrency(raffle.prizeAmount)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  {raffle.endDate
                    ? `Até ${formatDate(raffle.endDate)}`
                    : `A partir de ${formatDate(raffle.startDate)}`}
                </div>
                {raffle.minPurchaseAmount != null && raffle.minPurchaseAmount > 0 && (
                  <p className="text-xs text-amber-700 font-medium mb-2">
                    Valor mínimo de compra: {formatCurrency(raffle.minPurchaseAmount)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {QUICK_QUANTITIES.map((n) => {
                  const effectiveQty = Math.max(n, minQty)
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantity(raffle, effectiveQty)}
                      className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors ${
                        qty === effectiveQty
                          ? 'bg-yellow-400 text-black'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      +{n}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={() => setQuantity(raffle, qty - 1)}
                  className="bg-gray-200 text-gray-800 p-1.5 sm:p-2 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={qty <= minQty}
                >
                  <span className="text-lg sm:text-xl font-bold">−</span>
                </button>
                <span className="text-lg sm:text-xl font-bold min-w-[2rem] text-center text-black tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(raffle, qty + 1)}
                  className="bg-gray-200 text-gray-800 p-1.5 sm:p-2 rounded hover:bg-gray-300"
                >
                  <span className="text-lg sm:text-xl font-bold">+</span>
                </button>
              </div>

              <Link
                href={buyHref}
                className="block w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-green-500 transition-colors text-center"
              >
                COMPRAR – {formatCurrency(totalPrice)}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
