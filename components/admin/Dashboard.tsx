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
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats({
        totalUsers: data.totalUsers || 0,
        totalRaffles: data.totalRaffles || 0,
        activeRaffles: data.activeRaffles || 0,
        totalTickets: data.totalTickets || 0,
        totalRevenue: data.totalRevenue || 0,
        totalPayments: data.totalPayments || 0,
        totalWinners: data.totalWinners || 0,
        totalAffiliates: data.totalAffiliates || 0,
        recentPayments: data.recentPayments || [],
        topAffiliates: data.topAffiliates || [],
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalRaffles: 0,
        activeRaffles: 0,
        totalTickets: 0,
        totalRevenue: 0,
        totalPayments: 0,
        totalWinners: 0,
        totalAffiliates: 0,
        recentPayments: [],
        topAffiliates: [],
      })
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
    return (
      <div className="text-red-600 p-4">
        <p>Erro ao carregar estatísticas</p>
        <button
          onClick={fetchStats}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h2>
      
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Total de Usuários</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Arrecadação Total</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Rifas Ativas</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeRaffles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Tickets Vendidos</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalTickets}</p>
        </div>
      </div>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Total de Rifas</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalRaffles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Pagamentos</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPayments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Ganhadores</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalWinners}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Afiliados Ativos</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalAffiliates}</p>
        </div>
      </div>

      {/* Pagamentos recentes */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Pagamentos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-gray-700 font-semibold">Usuário</th>
                <th className="text-left p-2 text-gray-700 font-semibold">Valor</th>
                <th className="text-left p-2 text-gray-700 font-semibold">Status</th>
                <th className="text-left p-2 text-gray-700 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPayments && stats.recentPayments.length > 0 ? (
                stats.recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="p-2 text-gray-900">{payment.user?.name || 'N/A'}</td>
                    <td className="p-2 text-gray-900">{formatCurrency(payment.amount)}</td>
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
                    <td className="p-2 text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Nenhum pagamento recente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Afiliados */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Top Afiliados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-gray-700 font-semibold">Nome</th>
                <th className="text-left p-2 text-gray-700 font-semibold">Vendas</th>
                <th className="text-left p-2 text-gray-700 font-semibold">Comissões</th>
                <th className="text-left p-2 text-gray-700 font-semibold">Usuários</th>
              </tr>
            </thead>
            <tbody>
              {stats.topAffiliates && stats.topAffiliates.length > 0 ? (
                stats.topAffiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b">
                    <td className="p-2 text-gray-900">{affiliate.name}</td>
                    <td className="p-2 text-gray-900">{formatCurrency(affiliate.totalSales)}</td>
                    <td className="p-2 text-gray-900">{formatCurrency(affiliate.totalCommissions)}</td>
                    <td className="p-2 text-gray-900">{affiliate._count?.users || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Nenhum afiliado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

