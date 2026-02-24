'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { User, LogOut, Ticket } from 'lucide-react'

type TicketItem = {
  id: string
  number: string
  status: string
  createdAt: string
  raffle: { id: string; title: string; status: string; ticketPrice: number }
}

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [ticketsLoading, setTicketsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) {
      setTicketsLoading(false)
      return
    }
    fetch('/api/user/tickets', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setTickets(data.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setTicketsLoading(false))
  }, [user])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Você precisa estar logado para acessar o perfil.</p>
            <Link
              href="/login?next=/perfil"
              className="inline-block bg-yellow-400 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500"
            >
              Entrar
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu perfil</h1>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
                <User size={24} className="text-gray-800" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Ticket size={22} />
              Meus bilhetes
            </h2>
            {ticketsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                <p>Você ainda não tem bilhetes.</p>
                <Link
                  href="/comprar"
                  className="inline-block mt-2 text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Comprar cotas
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {tickets.map((t) => {
                  const numPart = t.number.includes('-') ? t.number.split('-').pop() ?? t.number : t.number
                  const displayNumber = /^\d+$/.test(numPart) ? numPart.padStart(6, '0') : numPart
                  return (
                    <li
                      key={t.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{t.raffle.title}</p>
                        <p className="text-sm text-gray-600">
                          Bilhete <span className="font-mono font-medium">{displayNumber}</span>
                          {t.status !== 'active' && (
                            <span className="ml-2 text-amber-600 capitalize">({t.status})</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Link
                        href={`/comprar?raffleId=${t.raffle.id}`}
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        Ver rifa
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/comprar"
              className="flex-1 text-center bg-yellow-400 text-gray-800 py-3 rounded-lg font-medium hover:bg-yellow-500"
            >
              Comprar cotas
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-3"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
