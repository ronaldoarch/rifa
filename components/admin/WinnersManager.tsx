'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, Check, X } from 'lucide-react'

interface Winner {
  id: string
  userId: string
  raffleId: string
  ticketId: string
  prizeAmount: number
  videoUrl: string | null
  testimonial: string | null
  isVerified: boolean
  user?: {
    name: string
    email: string
  }
  raffle?: {
    title: string
  }
}

interface Raffle {
  id: string
  title: string
}

export default function WinnersManager() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    raffleId: '',
    ticketId: '',
    prizeAmount: '',
    videoUrl: '',
    testimonial: '',
    isVerified: false,
  })

  useEffect(() => {
    fetchWinners()
    fetchRaffles()
  }, [])

  const fetchWinners = async () => {
    try {
      const response = await fetch('/api/admin/winners')
      const data = await response.json()
      setWinners(data)
    } catch (error) {
      console.error('Error fetching winners:', error)
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
      const url = editingWinner
        ? `/api/admin/winners/${editingWinner.id}`
        : '/api/admin/winners'
      const method = editingWinner ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          videoUrl: formData.videoUrl || null,
          testimonial: formData.testimonial || null,
        }),
      })

      if (response.ok) {
        fetchWinners()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving winner:', error)
      alert('Erro ao salvar ganhador')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este ganhador?')) return

    try {
      const response = await fetch(`/api/admin/winners/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchWinners()
      }
    } catch (error) {
      console.error('Error deleting winner:', error)
      alert('Erro ao deletar ganhador')
    }
  }

  const handleEdit = (winner: Winner) => {
    setEditingWinner(winner)
    setFormData({
      userId: winner.userId,
      raffleId: winner.raffleId,
      ticketId: winner.ticketId,
      prizeAmount: winner.prizeAmount.toString(),
      videoUrl: winner.videoUrl || '',
      testimonial: winner.testimonial || '',
      isVerified: winner.isVerified,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      userId: '',
      raffleId: '',
      ticketId: '',
      prizeAmount: '',
      videoUrl: '',
      testimonial: '',
      isVerified: false,
    })
    setEditingWinner(null)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Ganhadores</h2>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Adicionar Ganhador</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {winners && winners.length > 0 ? (
          winners.map((winner) => (
            <div key={winner.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {winner.user?.name || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-600">{winner.raffle?.title}</p>
                </div>
                {winner.isVerified ? (
                  <Check className="text-green-600" size={24} />
                ) : (
                  <X className="text-gray-400" size={24} />
                )}
              </div>
              <p className="text-xl font-bold text-green-600 mb-2">
                R$ {winner.prizeAmount.toLocaleString('pt-BR')}
              </p>
              {winner.videoUrl && (
                <div className="mb-4">
                  <video
                    src={winner.videoUrl}
                    controls
                    className="w-full rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
              {winner.testimonial && (
                <p className="text-sm text-gray-600 mb-4">{winner.testimonial}</p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(winner)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center space-x-1"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(winner.id)}
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
            Nenhum ganhador cadastrado
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {editingWinner ? 'Editar Ganhador' : 'Adicionar Ganhador'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  ID do Usuário *
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Rifa *
                </label>
                <select
                  value={formData.raffleId}
                  onChange={(e) =>
                    setFormData({ ...formData, raffleId: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione uma rifa</option>
                  {raffles.map((raffle) => (
                    <option key={raffle.id} value={raffle.id}>
                      {raffle.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    ID do Ticket *
                  </label>
                  <input
                    type="text"
                    value={formData.ticketId}
                    onChange={(e) =>
                      setFormData({ ...formData, ticketId: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Valor do Prêmio (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prizeAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, prizeAmount: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  URL do Vídeo
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Envie o vídeo para um serviço de hospedagem e cole a URL aqui
                </p>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Depoimento
                </label>
                <textarea
                  value={formData.testimonial}
                  onChange={(e) =>
                    setFormData({ ...formData, testimonial: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) =>
                    setFormData({ ...formData, isVerified: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-gray-700 font-bold">Verificado</label>
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

