'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Copy, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Affiliate {
  id: string
  name: string
  email: string
  phone: string | null
  commissionRate: number
  code: string
  link: string
  totalSales: number
  totalCommissions: number
  isActive: boolean
  _count: {
    users: number
  }
}

export default function AffiliatesManager() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commissionRate: '10',
    isActive: true,
  })

  useEffect(() => {
    fetchAffiliates()
  }, [])

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/admin/affiliates')
      const data = await response.json()
      setAffiliates(data)
    } catch (error) {
      console.error('Error fetching affiliates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAffiliate
        ? `/api/admin/affiliates/${editingAffiliate.id}`
        : '/api/admin/affiliates'
      const method = editingAffiliate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchAffiliates()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving affiliate:', error)
      alert('Erro ao salvar afiliado')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este afiliado?')) return

    try {
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAffiliates()
      }
    } catch (error) {
      console.error('Error deactivating affiliate:', error)
      alert('Erro ao desativar afiliado')
    }
  }

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate)
    setFormData({
      name: affiliate.name,
      email: affiliate.email,
      phone: affiliate.phone || '',
      commissionRate: affiliate.commissionRate.toString(),
      isActive: affiliate.isActive,
    })
    setShowModal(true)
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      commissionRate: '10',
      isActive: true,
    })
    setEditingAffiliate(null)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Afiliados</h2>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Novo Afiliado</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taxa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comissões
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuários
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {affiliates && affiliates.length > 0 ? (
              affiliates.map((affiliate) => (
                <tr key={affiliate.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {affiliate.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {affiliate.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {affiliate.commissionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(affiliate.totalSales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(affiliate.totalCommissions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {affiliate._count.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => copyLink(affiliate.link)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      {copiedLink === affiliate.link ? (
                        <>
                          <Check size={16} />
                          <span className="text-xs">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span className="text-xs">Copiar</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(affiliate)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} className="inline" />
                    </button>
                    {affiliate.isActive && (
                      <button
                        onClick={() => handleDelete(affiliate.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} className="inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Nenhum afiliado cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {editingAffiliate ? 'Editar Afiliado' : 'Novo Afiliado'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Taxa de Comissão (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commissionRate}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionRate: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              {editingAffiliate && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label className="text-gray-700 font-bold">Ativo</label>
                </div>
              )}
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

