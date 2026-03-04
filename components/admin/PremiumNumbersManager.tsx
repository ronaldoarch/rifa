'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Gift } from 'lucide-react'

interface PremiumNumber {
  id: string
  raffleId: string
  number: string
  prizeAmount: number
  raffle?: {
    id: string
    title: string
  }
}

interface Raffle {
  id: string
  title: string
  totalTickets: number
  soldTickets: number
}

export default function PremiumNumbersManager() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [premiumNumbers, setPremiumNumbers] = useState<PremiumNumber[]>([])
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formNumber, setFormNumber] = useState('')
  const [formPrize, setFormPrize] = useState('')

  const fetchRaffles = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/raffles')
      const data = await response.json()
      setRaffles(Array.isArray(data) ? data : [])
      if (data?.length) {
        setSelectedRaffleId((prev) => (prev ? prev : data[0].id))
      }
    } catch (error) {
      console.error('Error fetching raffles:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRaffles()
  }, [fetchRaffles])

  useEffect(() => {
    if (selectedRaffleId) {
      fetchPremiumNumbers(selectedRaffleId)
    } else {
      setPremiumNumbers([])
    }
  }, [selectedRaffleId])

  const fetchPremiumNumbers = async (raffleId: string) => {
    try {
      const response = await fetch(`/api/admin/premium-numbers?raffleId=${encodeURIComponent(raffleId)}`)
      const data = await response.json()
      setPremiumNumbers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching premium numbers:', error)
      setPremiumNumbers([])
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRaffleId || !formNumber.trim() || formPrize === '') return
    const amount = parseFloat(formPrize.replace(',', '.'))
    if (isNaN(amount) || amount < 0) {
      alert('Informe um valor de premiação válido.')
      return
    }
    setSaving(true)
    try {
      const numNormalized = formNumber.trim().replace(/\D/g, '')
      const numValue = numNormalized ? parseInt(numNormalized, 10) : NaN
      const numberToSend = !isNaN(numValue) && numValue >= 1 ? String(numValue) : formNumber.trim()

      const response = await fetch('/api/admin/premium-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: selectedRaffleId,
          number: numberToSend,
          prizeAmount: amount,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setFormNumber('')
        setFormPrize('')
        fetchPremiumNumbers(selectedRaffleId)
      } else {
        alert(data.error || 'Erro ao cadastrar bilhete premiado')
      }
    } catch (error) {
      console.error('Error adding premium number:', error)
      alert('Erro ao cadastrar bilhete premiado')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este número premiado?')) return
    try {
      const response = await fetch(`/api/admin/premium-numbers/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchPremiumNumbers(selectedRaffleId)
      } else {
        alert('Erro ao remover')
      }
    } catch (error) {
      console.error('Error deleting premium number:', error)
      alert('Erro ao remover')
    }
  }

  const selectedRaffle = raffles.find((r) => r.id === selectedRaffleId)
  const maxNumber = selectedRaffle ? Number(selectedRaffle.totalTickets) : 0

  /** Formata o número do bilhete com 6 dígitos (ex.: 7 → 000007) */
  const formatSixDigits = (n: string) => {
    const x = parseInt(n, 10)
    if (isNaN(x)) return n
    return String(x).padStart(6, '0')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift size={28} />
          Bilhetes premiados
        </h1>
        <p className="text-gray-600 mt-1">
          Defina quais números, ao serem comprados, premiam o usuário na hora com o valor indicado. O prêmio é creditado como saldo na plataforma.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rifa</label>
        <select
          value={selectedRaffleId}
          onChange={(e) => setSelectedRaffleId(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Selecione uma rifa</option>
          {raffles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
        {selectedRaffle && (
          <p className="text-sm text-gray-500 mt-2">
            Números de 6 dígitos: 000001 a {formatSixDigits(String(maxNumber))} (total de bilhetes da rifa)
          </p>
        )}
      </div>

      {selectedRaffleId && (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Adicionar número premiado</h2>
            <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Número do bilhete (6 dígitos)</label>
                <input
                  type="text"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="Ex: 000007 ou 7"
                  maxLength={6}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-36 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Premiação (R$)</label>
                <input
                  type="text"
                  value={formPrize}
                  onChange={(e) => setFormPrize(e.target.value)}
                  placeholder="0,00"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-32"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !formNumber.trim() || !formPrize}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} />
                {saving ? 'Salvando...' : 'Adicionar'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Números premiados desta rifa</h2>
            {premiumNumbers.length === 0 ? (
              <p className="p-6 text-gray-500">Nenhum número premiado cadastrado. Adicione acima.</p>
            ) : (
              <ul className="divide-y">
                {premiumNumbers.map((pn) => (
                  <li key={pn.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <span className="font-mono font-medium">Bilhete nº {formatSixDigits(pn.number)}</span>
                    <span className="text-green-600 font-semibold">
                      R$ {Number(pn.prizeAmount).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(pn.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
