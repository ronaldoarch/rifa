'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Ticket, Upload, Trophy } from 'lucide-react'

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
    minPurchaseAmount: '',
    imageUrl: '',
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showResultadoModal, setShowResultadoModal] = useState(false)
  const [resultadoRaffle, setResultadoRaffle] = useState<Raffle | null>(null)
  const [winningNumberInput, setWinningNumberInput] = useState('')
  const [submittingResultado, setSubmittingResultado] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', 'raffle')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setFormData((f) => ({ ...f, imageUrl: data.url }))
      else alert(data.error || 'Erro no upload')
    } catch {
      alert('Erro ao enviar imagem')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    fetchRaffles()
  }, [])

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/admin/raffles')
      const data = await response.json()
      setRaffles(Array.isArray(data) ? data : [])
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

  const openResultadoModal = (raffle: Raffle) => {
    setResultadoRaffle(raffle)
    setWinningNumberInput('')
    setShowResultadoModal(true)
  }

  const handleSubmitResultado = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resultadoRaffle) return
    const num = winningNumberInput.replace(/\D/g, '').trim()
    if (!num) {
      alert('Informe o número vencedor (ex.: resultado da Loteria Federal)')
      return
    }
    setSubmittingResultado(true)
    try {
      const res = await fetch(`/api/admin/raffles/${resultadoRaffle.id}/resultado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winningNumber: num }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Erro ao registrar resultado')
        setSubmittingResultado(false)
        return
      }
      alert(data.message + (data.winner ? ` Ganhador: ${data.winner.userName} (bilhete ${data.winner.ticketNumber}).` : ''))
      setShowResultadoModal(false)
      setResultadoRaffle(null)
      setWinningNumberInput('')
      fetchRaffles()
    } catch (err) {
      console.error(err)
      alert('Erro ao enviar resultado')
    } finally {
      setSubmittingResultado(false)
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
      minPurchaseAmount: raffle.minPurchaseAmount != null ? raffle.minPurchaseAmount.toString() : '',
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
      totalTickets: '100000', // padrão Loteria Federal: 100.000 bilhetes (00000 a 99999)
      ticketPrice: '',
      minPurchaseAmount: '',
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Rifas</h2>
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
                    {(raffle.status === 'active' || raffle.status === 'upcoming') && (
                      <button
                        onClick={() => openResultadoModal(raffle)}
                        className="text-amber-600 hover:text-amber-800 mr-3"
                        title="Informar resultado (Loteria Federal)"
                      >
                        <Trophy size={18} className="inline" />
                      </button>
                    )}
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
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={formData.totalTickets}
                      onChange={(e) =>
                        setFormData({ ...formData, totalTickets: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      min={1}
                      placeholder="Ex: 100000"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, totalTickets: '100000' })
                      }
                      className="whitespace-nowrap px-3 py-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-sm font-medium hover:bg-amber-200"
                      title="Padrão Loteria Federal: 100.000 bilhetes (00000 a 99999)"
                    >
                      Loteria Federal (100.000)
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Bilhetes com <strong>6 dígitos</strong> (000001 a 999999). Padrão Loteria Federal: 100.000.
                  </p>
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
                  Valor mínimo de compra (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.minPurchaseAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minPurchaseAmount: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Deixe em branco ou 0 para não exigir valor mínimo.
                </p>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Imagem da rifa
                </label>
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 font-medium text-sm">
                    <Upload size={16} />
                    {uploadingImage ? 'Enviando...' : 'Enviar imagem'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                  <span className="text-sm text-gray-500">ou cole a URL</span>
                </div>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://... ou /uploads/raffle/arquivo.jpg"
                />
                {formData.imageUrl ? (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="max-h-24 rounded border border-gray-200"
                    />
                  </div>
                ) : null}
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

      {showResultadoModal && resultadoRaffle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              Resultado — Loteria Federal
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {resultadoRaffle.title}. Informe o número vencedor (5 ou 6 dígitos) do sorteio oficial.
            </p>
            <form onSubmit={handleSubmitResultado} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Número vencedor
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={winningNumberInput}
                  onChange={(e) => setWinningNumberInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Ex.: 12345 ou 012345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  O sistema busca o bilhete com esse número, confirma o pagamento e encerra a rifa.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingResultado}
                  className="flex-1 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {submittingResultado ? 'Registrando...' : 'Registrar resultado'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResultadoModal(false)
                    setResultadoRaffle(null)
                    setWinningNumberInput('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
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

