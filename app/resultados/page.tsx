'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'
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
}

export default function ResultsPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/raffles?forResultados=1')
      .then((res) => res.json())
      .then((data) => setRaffles(Array.isArray(data) ? data : []))
      .catch(() => setRaffles([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-black">Resultados</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <p className="text-gray-700 mb-8">
            Selecione uma rifa abaixo para visualizar os resultados dos sorteios.
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
            </div>
          ) : raffles.length === 0 ? (
            <p className="text-gray-600">Nenhuma rifa cadastrada no momento.</p>
          ) : (
            <div className="space-y-4">
              {raffles.map((raffle) => (
                <Link
                  key={raffle.id}
                  href={`/resultados/${raffle.id}`}
                  className="block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl sm:text-3xl">
                        🎯
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {raffle.title}
                        </h3>
                        <p className="text-gray-600">
                          {raffle.description || `Prêmio: ${formatCurrency(raffle.prizeAmount)}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

