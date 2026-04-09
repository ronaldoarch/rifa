'use client'

import { useState, useEffect } from 'react'
import { Key, Save, Eye, EyeOff } from 'lucide-react'

export default function GateboxCredentialsManager() {
  const [apiUrl, setApiUrl] = useState('https://api.gatebox.com.br')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        setApiUrl(data.GATEBOX_API_URL || 'https://api.gatebox.com.br')
        setUsername(data.GATEBOX_USERNAME || '')
        setPassword(data.GATEBOX_PASSWORD || '')
      })
      .catch(() => setMessage('Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          GATEBOX_API_URL: apiUrl.trim() || 'https://api.gatebox.com.br',
          GATEBOX_USERNAME: username.trim(),
          GATEBOX_PASSWORD: password,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setMessage('Credenciais Gatebox salvas. Ative "Gatebox" em Gateway PIX para usar na compra.')
        setTimeout(() => { setSaved(false); setMessage('') }, 5000)
      } else {
        const data = await res.json().catch(() => ({}))
        setMessage(data.error || 'Erro ao salvar')
      }
    } catch {
      setMessage('Erro ao salvar credenciais')
    } finally {
      setSaving(false)
    }
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Key size={32} />
          Gatebox (Gateway PIX)
        </h2>
        <p className="text-gray-600 mt-1">
          Configure as credenciais da API Gatebox para gerar PIX na hora da compra. Sem isso, o PIX não será gerado automaticamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL da API</label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.gatebox.com.br"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Padrão: https://api.gatebox.com.br</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (CNPJ/CPF)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="93892492000158"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <p className={`mt-4 text-sm ${message.startsWith('Erro') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !username.trim() || !password}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar credenciais'}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">Salvo!</span>}
        </div>
      </form>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-xl">
        <p className="text-sm text-amber-800">
          <strong>Segurança:</strong> As credenciais ficam armazenadas no banco (Config) e são usadas apenas no servidor para criar o PIX. Não são exibidas em locais públicos.
        </p>
      </div>
    </div>
  )
}
