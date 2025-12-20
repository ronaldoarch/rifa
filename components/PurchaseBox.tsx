'use client'

import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PurchaseBoxProps {
  quantity: number
  setQuantity: (qty: number) => void
}

export default function PurchaseBox({ quantity, setQuantity }: PurchaseBoxProps) {
  const router = useRouter()
  const basePrice = 19.95
  const price = basePrice * quantity

  const quantityOptions = [3, 10, 15, 20, 30]

  const handlePurchase = () => {
    // UTMfy will automatically append UTM parameters to the URL
    const url = `/comprar?quantity=${quantity}`
    
    // Track purchase intent event
    if (typeof window !== 'undefined' && (window as any).utmify) {
      (window as any).utmify.track('purchase_intent', {
        quantity,
        price,
      })
    }
    
    router.push(url)
  }

  return (
    <div className="bg-green-900 rounded-lg p-4 sm:p-6 shadow-2xl w-full max-w-md">
      {/* Quantity buttons */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {quantityOptions.map((qty) => (
          <button
            key={qty}
            onClick={() => setQuantity(qty)}
            className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium transition-colors ${
              quantity === qty
                ? 'bg-yellow-400 text-black'
                : 'bg-green-800 text-white hover:bg-green-700'
            }`}
          >
            +{qty}
          </button>
        ))}
      </div>

      {/* Discount badge */}
      {quantity >= 15 && (
        <div className="bg-yellow-400 text-black text-center py-1.5 sm:py-2 rounded mb-3 sm:mb-4">
          <div className="font-bold text-sm sm:text-base">16% OFF</div>
          <div className="text-xs">POPULAR</div>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="bg-green-800 text-white p-1.5 sm:p-2 rounded hover:bg-green-700"
        >
          <Minus size={18} className="sm:w-5 sm:h-5" />
        </button>
        <span className="text-white text-xl sm:text-2xl font-bold">{quantity}</span>
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
        <span>COMPRAR - R$ {price.toFixed(2).replace('.', ',')}</span>
      </button>
    </div>
  )
}

