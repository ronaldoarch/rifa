'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

interface Promotion {
  id: string
  raffleId: string | null
  title: string
  description: string | null
  discount: number
  minQuantity: number
  maxQuantity: number | null
  badge: string | null
  isActive: boolean
  raffle?: {
    id: string
    title: string
  }
}

interface Raffle {
  id: string
  title: string
}

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    raffleId: '',
    title: '',
    description: '',
    discount: '',
    minQuantity: '1',
    maxQuantity: '',
    badge: '',
    isActive: true,
  })

  useEffect(() => {
    fetchPromotions()
    fetchRaffles()
  }, [])

  const fetchPromotions = async () => {
    try {
      const response = await fetch('/api/admin/promotions')
      const data = await response.json()
      setPromotions(data)
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/admin/raffles')
      const data = await response.json()
      setRaffles(data)
    } catch (error) {
      console.error('Error fetching raffles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingPromotion
        ? `/api/admin/promotions/${editingPromotion.id}`
        : '/api/admin/promotions'
      const method = editingPromotion ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          raffleId: formData.raffleId || null,
          maxQuantity: formData.maxQuantity || null,
          badge: formData.badge || null,
        }),
      })

      if (response.ok) {
        fetchPromotions()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving promotion:', error)
      alert('Erro ao salvar promoção')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return

    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPromotions()
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
      alert('Erro ao deletar promoção')
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      raffleId: promotion.raffleId || '',
      title: promotion.title,
      description: promotion.description || '',
      discount: promotion.discount.toString(),
      minQuantity: promotion.minQuantity.toString(),
      maxQuantity: promotion.maxQuantity?.toString() || '',
      badge: promotion.badge || '',
      isActive: promotion.isActive,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      raffleId: '',
      title: '',
      description: '',
      discount: '',
      minQuantity: '1',
      maxQuantity: '',
      badge: '',
      isActive: true,
    })
    setEditingPromotion(null)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Promoções</h2>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nova Promoção</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions && promotions.length > 0 ? (
          promotions.map((promotion) => (
            <div key={promotion.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{promotion.title}</h3>
                  {promotion.badge && (
                    <span className="inline-block mt-1 px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded">
                      {promotion.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    promotion.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {promotion.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {promotion.raffle ? `Rifa: ${promotion.raffle.title}` : 'Todas as rifas'}
              </p>
              <p className="text-lg font-bold text-green-600 mb-2">
                {promotion.discount}% OFF
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Mínimo: {promotion.minQuantity}{' '}
                {promotion.maxQuantity && `- Máximo: ${promotion.maxQuantity}`}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(promotion)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center space-x-1"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(promotion.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 flex items-center justify-center space-x-1"
                >
                  <Trash2 size={16} />
                  <span>Deletar</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            Nenhuma promoção cadastrada
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Rifa (opcional - deixe vazio para todas)
                </label>
                <select
                  value={formData.raffleId}
                  onChange={(e) =>
                    setFormData({ ...formData, raffleId: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Todas as rifas</option>
                  {raffles.map((raffle) => (
                    <option key={raffle.id} value={raffle.id}>
                      {raffle.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Desconto (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Quantidade Mínima *
                  </label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, minQuantity: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Quantidade Máxima
                  </label>
                  <input
                    type="number"
                    value={formData.maxQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxQuantity: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Badge (ex: &quot;POPULAR&quot;, &quot;16% OFF&quot;)
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="POPULAR"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-gray-700 font-bold">Ativa</label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

