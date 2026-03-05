'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { formatCurrency } from '@/lib/utils'

interface Winner {
  name: string
  prizeAmount: number
}

interface RaffleResult {
  id: string
  title: string
  description: string | null
  prizeAmount: number
  status: string
  winners: Winner[]
}

export default function RaffleResultsPage() {
  const params = useParams()
  const id = params?.id as string
  const [raffle, setRaffle] = useState<RaffleResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/raffles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setRaffle)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <Link href="/resultados" className="text-black/70 hover:text-black text-sm mb-2 inline-block">
              ← Voltar aos resultados
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-black">Resultados</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
            </div>
          ) : error || !raffle ? (
            <p className="text-gray-600">Rifa não encontrada.</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{raffle.title}</h2>
              {raffle.description && (
                <p className="text-gray-600 mb-6">{raffle.description}</p>
              )}
              <p className="text-gray-700 mb-6">
                Prêmio: <strong>{formatCurrency(raffle.prizeAmount)}</strong>
              </p>

              {raffle.winners.length === 0 ? (
                <p className="text-gray-600">Ainda não há ganhadores divulgados para esta rifa.</p>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800">Ganhadores</h3>
                  <ul className="bg-gray-50 rounded-lg divide-y divide-gray-200 overflow-hidden">
                    {raffle.winners.map((winner, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
                      >
                        <span className="font-medium text-gray-800">{winner.name}</span>
                        <span className="text-green-700 font-bold">
                          {formatCurrency(winner.prizeAmount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
