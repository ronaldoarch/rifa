'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  totalUsers: number
  totalRaffles: number
  activeRaffles: number
  totalTickets: number
  totalRevenue: number
  totalPayments: number
  totalWinners: number
  totalAffiliates: number
  recentPayments: any[]
  topAffiliates: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-red-600">Erro ao carregar estatísticas</div>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Total de Usuários</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Arrecadação Total</h3>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Rifas Ativas</h3>
          <p className="text-3xl font-bold">{stats.activeRaffles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Tickets Vendidos</h3>
          <p className="text-3xl font-bold">{stats.totalTickets}</p>
        </div>
      </div>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Total de Rifas</h3>
          <p className="text-3xl font-bold">{stats.totalRaffles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Pagamentos</h3>
          <p className="text-3xl font-bold">{stats.totalPayments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Ganhadores</h3>
          <p className="text-3xl font-bold">{stats.totalWinners}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Afiliados Ativos</h3>
          <p className="text-3xl font-bold">{stats.totalAffiliates}</p>
        </div>
      </div>

      {/* Pagamentos recentes */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Pagamentos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Usuário</th>
                <th className="text-left p-2">Valor</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="p-2">{payment.user?.name || 'N/A'}</td>
                  <td className="p-2">{formatCurrency(payment.amount)}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Afiliados */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Top Afiliados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nome</th>
                <th className="text-left p-2">Vendas</th>
                <th className="text-left p-2">Comissões</th>
                <th className="text-left p-2">Usuários</th>
              </tr>
            </thead>
            <tbody>
              {stats.topAffiliates.map((affiliate) => (
                <tr key={affiliate.id} className="border-b">
                  <td className="p-2">{affiliate.name}</td>
                  <td className="p-2">{formatCurrency(affiliate.totalSales)}</td>
                  <td className="p-2">{formatCurrency(affiliate.totalCommissions)}</td>
                  <td className="p-2">{affiliate._count.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

