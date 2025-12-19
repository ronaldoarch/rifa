'use client'

import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
    router.push(`/comprar?quantity=${quantity}`)
  }

  return (
    <div className="bg-green-900 rounded-lg p-6 shadow-2xl w-full max-w-md">
      {/* Quantity buttons */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {quantityOptions.map((qty) => (
          <button
            key={qty}
            onClick={() => setQuantity(qty)}
            className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
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
        <div className="bg-yellow-400 text-black text-center py-2 rounded mb-4">
          <div className="font-bold">16% OFF</div>
          <div className="text-xs">POPULAR</div>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="bg-green-800 text-white p-2 rounded hover:bg-green-700"
        >
          <Minus size={20} />
        </button>
        <span className="text-white text-2xl font-bold">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="bg-green-800 text-white p-2 rounded hover:bg-green-700"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Purchase button */}
      <button
        onClick={handlePurchase}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-500 transition-colors flex items-center justify-center space-x-2"
      >
        <ShoppingCart size={24} />
        <span>COMPRAR - R$ {price.toFixed(2).replace('.', ',')}</span>
      </button>
    </div>
  )
}

