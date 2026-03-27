'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Cloud, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  status: string
  paymentMethod: string
  transactionId: string | null
  createdAt: string
  user: {
    name: string
    email: string
    cpf: string
  }
  tickets: Array<{
    id: string
    number: string
  }>
}

export default function PaymentsManager() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [cancellingExpired, setCancellingExpired] = useState(false)
  const [expireMinutes, setExpireMinutes] = useState(60)
  const [cyberModalJson, setCyberModalJson] = useState<string | null>(null)
  const [cyberLoadingPaymentId, setCyberLoadingPaymentId] = useState<string | null>(null)

  const handleCyberLookup = async (payment: Payment) => {
    const tid = payment.transactionId?.trim()
    if (!tid) {
      toast.error('Este pagamento não tem ID de transação do gateway.')
      return
    }
    setCyberLoadingPaymentId(payment.id)
    try {
      const res = await fetch(
        `/api/admin/cyber/transactions/${encodeURIComponent(tid)}`,
        { credentials: 'include' }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : 'Erro ao consultar a Cyber')
        return
      }
      setCyberModalJson(JSON.stringify(data, null, 2))
    } catch {
      toast.error('Erro de rede ao consultar a Cyber')
    } finally {
      setCyberLoadingPaymentId(null)
    }
  }

  const handleUpdateStatus = async (paymentId: string, status: string) => {
    const isCancelling = status === 'failed'
    const msg = status === 'paid'
      ? 'Marcar este pagamento como pago? Os tickets já foram criados.'
      : isCancelling
      ? 'Cancelar este pagamento? Os tickets serão anulados e as vagas na rifa serão liberadas.'
      : 'Estornar este pagamento?'
    if (!confirm(msg)) return
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (res.ok) {
        if (isCancelling && data.ticketsVoided > 0) {
          toast.success(`Pagamento cancelado. ${data.ticketsVoided} ticket(s) anulado(s) e vagas liberadas.`)
        } else {
          toast.success('Pagamento atualizado com sucesso')
        }
        fetchPayments()
      } else {
        toast.error(data.error || 'Erro ao atualizar')
      }
    } catch {
      toast.error('Erro ao atualizar pagamento')
    }
  }

  const handleCancelExpired = async () => {
    if (!confirm(
      `Cancelar TODOS os pagamentos PIX pendentes com mais de ${expireMinutes} minutos?\n\n` +
      `Os tickets serão anulados e as vagas nas rifas serão liberadas.`
    )) return

    setCancellingExpired(true)
    try {
      const res = await fetch('/api/admin/payments/cancel-expired', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutesOld: expireMinutes }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.cancelled === 0) {
          toast.info('Nenhum pagamento expirado encontrado.')
        } else {
          toast.success(
            `${data.cancelled} pagamento(s) cancelado(s). ` +
            `${data.ticketsVoided} ticket(s) anulado(s). ` +
            `${data.rafflesUpdated} rifa(s) atualizada(s).`
          )
          fetchPayments()
        }
      } else {
        toast.error(data.error || 'Erro ao cancelar')
      }
    } catch {
      toast.error('Erro ao cancelar pagamentos expirados')
    } finally {
      setCancellingExpired(false)
    }
  }

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const url = `/api/admin/payments?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ''}`
      const response = await fetch(url)
      const data = await response.json()
      setPayments(data.payments || [])
      setPagination(data.pagination || { total: 0, totalPages: 0 })
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page])

  if (loading && payments.length === 0) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      {cyberModalJson && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/50 border-0 cursor-default"
          aria-label="Fechar"
          onClick={() => setCyberModalJson(null)}
        />
      )}
      {cyberModalJson && (
        <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
          <div
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col pointer-events-auto border border-gray-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cyber-modal-title"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 id="cyber-modal-title" className="text-lg font-semibold text-gray-900">
                Resposta Cyber Payment
              </h3>
              <button
                type="button"
                onClick={() => setCyberModalJson(null)}
                className="text-gray-500 hover:text-gray-800 text-sm font-medium px-2 py-1"
              >
                Fechar
              </button>
            </div>
            <pre className="text-xs overflow-auto p-4 flex-1 bg-gray-50 text-gray-800 whitespace-pre-wrap break-all">
              {cyberModalJson}
            </pre>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Pagamentos</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="failed">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>
      </div>

      {/* Banner de cancelamento em massa */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex flex-wrap items-center gap-3">
          <AlertTriangle size={20} className="text-orange-500 flex-shrink-0" />
          <span className="text-sm text-orange-800 font-medium flex-1">
            Cancelar pagamentos PIX pendentes expirados (anula tickets e libera vagas):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-orange-700">Mais antigos que</label>
            <select
              value={expireMinutes}
              onChange={(e) => setExpireMinutes(Number(e.target.value))}
              className="px-2 py-1 border border-orange-300 rounded text-sm bg-white"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={1440}>1 dia</option>
              <option value={4320}>3 dias</option>
            </select>
            <button
              onClick={handleCancelExpired}
              disabled={cancellingExpired}
              className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              {cancellingExpired ? 'Cancelando...' : 'Cancelar expirados'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length > 0 ? (
              payments.map((payment) => {
                const ageMinutes = Math.floor((Date.now() - new Date(payment.createdAt).getTime()) / 60000)
                const isOld = payment.status === 'pending' && ageMinutes > 60
                return (
                  <tr key={payment.id} className={isOld ? 'bg-orange-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.user.name}</div>
                      <div className="text-xs text-gray-500">{payment.user.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {payment.paymentMethod.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status === 'paid' ? 'Pago' :
                         payment.status === 'pending' ? 'Pendente' :
                         payment.status === 'failed' ? 'Cancelado' :
                         payment.status === 'refunded' ? 'Estornado' : payment.status}
                      </span>
                      {isOld && (
                        <span className="ml-1 text-xs text-orange-600 font-medium">
                          ({ageMinutes < 1440
                            ? `${Math.floor(ageMinutes / 60)}h${ageMinutes % 60}m`
                            : `${Math.floor(ageMinutes / 1440)}d`})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {payment.tickets.length}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(payment.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {payment.paymentMethod === 'pix' && payment.transactionId && (
                          <button
                            type="button"
                            onClick={() => handleCyberLookup(payment)}
                            disabled={cyberLoadingPaymentId === payment.id}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium text-left inline-flex items-center gap-1 disabled:opacity-50"
                            title="GET /payments/transactions/{id} na API Cyber"
                          >
                            <Cloud size={12} className="flex-shrink-0" />
                            {cyberLoadingPaymentId === payment.id ? 'Consultando…' : 'Status na Cyber'}
                          </button>
                        )}
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(payment.id, 'paid')}
                              className="text-xs text-green-600 hover:text-green-800 font-medium text-left"
                            >
                              ✓ Marcar pago
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(payment.id, 'failed')}
                              className="text-xs text-red-600 hover:text-red-800 font-medium text-left"
                            >
                              ✕ Cancelar
                            </button>
                          </>
                        )}
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => handleUpdateStatus(payment.id, 'refunded')}
                            className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                          >
                            ↩ Estornar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum pagamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-right">
        Total: {pagination.total} pagamento(s)
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 text-sm"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm">
            Página {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 text-sm"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
