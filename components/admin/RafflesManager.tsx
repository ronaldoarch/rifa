'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Ticket } from 'lucide-react'

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
  imageUrl: string | null
  _count?: {
    tickets: number
    winners: number
  }
}

export default function RafflesManager() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    status: 'active',
    startDate: '',
    endDate: '',
    totalTickets: '',
    ticketPrice: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchRaffles()
  }, [])

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/admin/raffles')
      const data = await response.json()
      setRaffles(data)
    } catch (error) {
      console.error('Error fetching raffles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingRaffle
        ? `/api/admin/raffles/${editingRaffle.id}`
        : '/api/admin/raffles'
      const method = editingRaffle ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchRaffles()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving raffle:', error)
      alert('Erro ao salvar rifa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta rifa?')) return

    try {
      const response = await fetch(`/api/admin/raffles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error deleting raffle:', error)
      alert('Erro ao deletar rifa')
    }
  }

  const handleEdit = (raffle: Raffle) => {
    setEditingRaffle(raffle)
    setFormData({
      title: raffle.title,
      description: raffle.description || '',
      prizeAmount: raffle.prizeAmount.toString(),
      status: raffle.status,
      startDate: new Date(raffle.startDate).toISOString().split('T')[0],
      endDate: raffle.endDate
        ? new Date(raffle.endDate).toISOString().split('T')[0]
        : '',
      totalTickets: raffle.totalTickets.toString(),
      ticketPrice: raffle.ticketPrice.toString(),
      imageUrl: raffle.imageUrl || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prizeAmount: '',
      status: 'active',
      startDate: '',
      endDate: '',
      totalTickets: '',
      ticketPrice: '',
      imageUrl: '',
    })
    setEditingRaffle(null)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Rifas</h2>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nova Rifa</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prêmio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tickets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {raffles && raffles.length > 0 ? (
              raffles.map((raffle) => (
                <tr key={raffle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {raffle.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {raffle.prizeAmount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {raffle.soldTickets} / {raffle.totalTickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        raffle.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : raffle.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {raffle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(raffle)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} className="inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(raffle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} className="inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma rifa cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {editingRaffle ? 'Editar Rifa' : 'Nova Rifa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    Prêmio (R$) *
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
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Preço do Ticket (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, ticketPrice: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Total de Tickets
                  </label>
                  <input
                    type="number"
                    value={formData.totalTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, totalTickets: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="active">Ativa</option>
                    <option value="upcoming">Próxima</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
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

