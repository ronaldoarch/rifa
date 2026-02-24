'use client'

import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export type PrincipalRaffle = {
  id: string
  ticketPrice: number
  minPurchaseAmount?: number | null
}

interface PurchaseBoxProps {
  quantity: number
  setQuantity: (qty: number) => void
  /** Rifa principal: preço e link vêm dela. Se não passar, usa preço fixo e link sem raffleId. */
  principalRaffle?: PrincipalRaffle | null
}

export default function PurchaseBox({ quantity, setQuantity, principalRaffle }: PurchaseBoxProps) {
  const router = useRouter()
  const ticketPrice = principalRaffle?.ticketPrice ?? 19.95
  const minPurchase = principalRaffle?.minPurchaseAmount ?? 0
  const minQty = minPurchase > 0 ? Math.ceil(minPurchase / ticketPrice) : 1
  const effectiveQty = Math.max(quantity, minQty)
  const price = ticketPrice * effectiveQty

  const quantityOptions = [3, 10, 15, 20, 30].map((n) => Math.max(n, minQty))
  const uniqueOptions = [...new Set(quantityOptions)]

  const handlePurchase = () => {
    const params = new URLSearchParams()
    params.set('quantity', String(effectiveQty))
    if (principalRaffle?.id) params.set('raffleId', principalRaffle.id)
    const url = `/comprar?${params.toString()}`

    if (typeof window !== 'undefined' && (window as any).utmify) {
      (window as any).utmify.track('purchase_intent', {
        quantity: effectiveQty,
        price,
        raffleId: principalRaffle?.id,
      })
    }
    router.push(url)
  }

  return (
    <div className="bg-green-900 rounded-lg p-4 sm:p-6 shadow-2xl w-full max-w-md">
      {/* Quantity buttons */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {uniqueOptions.slice(0, 5).map((qty) => (
          <button
            key={qty}
            onClick={() => setQuantity(qty)}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors ${
              effectiveQty === qty
                ? 'bg-yellow-400 text-black'
                : 'bg-green-800 text-white hover:bg-green-700'
            }`}
          >
            +{qty}
          </button>
        ))}
      </div>

      {/* Discount badge */}
      {effectiveQty >= 15 && (
        <div className="bg-yellow-400 text-black text-center py-1.5 sm:py-2 rounded mb-3 sm:mb-4">
          <div className="font-bold text-sm sm:text-base">16% OFF</div>
          <div className="text-xs">POPULAR</div>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
        <button
          onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
          disabled={quantity <= minQty}
          className="bg-green-800 text-white p-1.5 sm:p-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={18} className="sm:w-5 sm:h-5" />
        </button>
        <span className="text-white text-xl sm:text-2xl font-bold">{effectiveQty}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="bg-green-800 text-white p-1.5 sm:p-2 rounded hover:bg-green-700"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Purchase button */}
      <button
        onClick={handlePurchase}
        className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-green-500 transition-colors flex items-center justify-center space-x-2"
      >
        <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
        <span>COMPRAR - {formatCurrency(price)}</span>
      </button>
    </div>
  )
}

