'use client'

import { useState, useEffect } from 'react'
import { Key, Save, Eye, EyeOff } from 'lucide-react'
import XGateCredentialsManager from '@/components/admin/XGateCredentialsManager'
import GateboxCredentialsManager from '@/components/admin/GateboxCredentialsManager'

const GATEWAYS = [
  { value: 'xgate', label: 'XGate' },
  { value: 'gatebox', label: 'Gatebox' },
  { value: 'cyber', label: 'Cyber Payment (Escale Cyber)' },
  { value: 'sarrix', label: 'SarrixPay' },
] as const

export default function PixGatewayManager() {
  const [gateway, setGateway] = useState<string>('xgate')
  const [gwLoading, setGwLoading] = useState(true)
  const [gwSaving, setGwSaving] = useState(false)
  const [gwMessage, setGwMessage] = useState('')

  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.escalecyber.com/v1')
  const [showKey, setShowKey] = useState(false)
  const [cyberLoading, setCyberLoading] = useState(true)
  const [cyberSaving, setCyberSaving] = useState(false)
  const [cyberSaved, setCyberSaved] = useState(false)
  const [cyberMessage, setCyberMessage] = useState('')

  const [sarrixClientId, setSarrixClientId] = useState('')
  const [sarrixSecret, setSarrixSecret] = useState('')
  const [sarrixBaseUrl, setSarrixBaseUrl] = useState('https://apiv1.sarrixpay.com')
  const [sarrixLoading, setSarrixLoading] = useState(true)
  const [sarrixSaving, setSarrixSaving] = useState(false)
  const [sarrixSaved, setSarrixSaved] = useState(false)
  const [sarrixMessage, setSarrixMessage] = useState('')
  const [showSarrixSecret, setShowSarrixSecret] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setGateway(data.PIX_GATEWAY || 'xgate')
        setBaseUrl(data.CYBER_PAYMENT_BASE_URL || 'https://api.escalecyber.com/v1')
        setApiKey(data.CYBER_PAYMENT_API_KEY || '')
        setSarrixClientId(data.SARRIXPAY_CLIENT_ID || '')
        setSarrixSecret(data.SARRIXPAY_CLIENT_SECRET || '')
        setSarrixBaseUrl(data.SARRIXPAY_BASE_URL || 'https://apiv1.sarrixpay.com')
      })
      .catch(() => setGwMessage('Erro ao carregar gateway ativo'))
      .finally(() => {
        setGwLoading(false)
        setCyberLoading(false)
        setSarrixLoading(false)
      })
  }, [])

  const saveGateway = async (e: React.FormEvent) => {
    e.preventDefault()
    setGwMessage('')
    setGwSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ PIX_GATEWAY: gateway }),
      })
      if (res.ok) {
        setGwMessage('Gateway ativo atualizado.')
        setTimeout(() => setGwMessage(''), 4000)
      } else {
        const data = await res.json().catch(() => ({}))
        setGwMessage(data.error || 'Erro ao salvar')
      }
    } catch {
      setGwMessage('Erro ao salvar gateway')
    } finally {
      setGwSaving(false)
    }
  }

  const saveCyber = async (e: React.FormEvent) => {
    e.preventDefault()
    setCyberMessage('')
    setCyberSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          CYBER_PAYMENT_API_KEY: apiKey.trim(),
          CYBER_PAYMENT_BASE_URL: baseUrl.trim() || 'https://api.escalecyber.com/v1',
        }),
      })
      if (res.ok) {
        setCyberSaved(true)
        setCyberMessage('Credenciais Cyber Payment salvas.')
        setTimeout(() => {
          setCyberSaved(false)
          setCyberMessage('')
        }, 5000)
      } else {
        const data = await res.json().catch(() => ({}))
        setCyberMessage(data.error || 'Erro ao salvar')
      }
    } catch {
      setCyberMessage('Erro ao salvar credenciais')
    } finally {
      setCyberSaving(false)
    }
  }

  const saveSarrix = async (e: React.FormEvent) => {
    e.preventDefault()
    setSarrixMessage('')
    setSarrixSaving(true)
    try {
      const secretTrim = sarrixSecret.trim()
      const secretLooksMasked = /^•+$/.test(secretTrim)
      const payload: Record<string, string> = {
        SARRIXPAY_CLIENT_ID: sarrixClientId.trim(),
        SARRIXPAY_BASE_URL: sarrixBaseUrl.trim() || 'https://apiv1.sarrixpay.com',
      }
      if (secretTrim && !secretLooksMasked) {
        payload.SARRIXPAY_CLIENT_SECRET = secretTrim
      }
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSarrixSaved(true)
        setSarrixMessage('Credenciais SarrixPay salvas.')
        if (payload.SARRIXPAY_CLIENT_SECRET) {
          setSarrixSecret('••••••••')
        }
        setTimeout(() => {
          setSarrixSaved(false)
          setSarrixMessage('')
        }, 5000)
      } else {
        const data = await res.json().catch(() => ({}))
        setSarrixMessage(data.error || 'Erro ao salvar')
      }
    } catch {
      setSarrixMessage('Erro ao salvar credenciais')
    } finally {
      setSarrixSaving(false)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Key size={32} />
          Gateway PIX
        </h2>
        <p className="text-gray-600 mt-1">
          Escolha qual provedor gera o PIX na compra. Configure as credenciais do provedor correspondente abaixo.
        </p>
      </div>

      {gwLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
        </div>
      ) : (
        <form
          onSubmit={saveGateway}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Gateway ativo</label>
          <select
            value={gateway}
            onChange={(e) => setGateway(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
          >
            {GATEWAYS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={gwSaving}
            className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50"
          >
            <Save size={18} />
            {gwSaving ? 'Salvando...' : 'Salvar gateway ativo'}
          </button>
          {gwMessage && (
            <p className={`mt-3 text-sm ${gwMessage.startsWith('Erro') ? 'text-red-600' : 'text-green-600'}`}>
              {gwMessage}
            </p>
          )}
        </form>
      )}

      <div className="border-t border-gray-200 pt-10 space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Cyber Payment</h3>
        <p className="text-gray-600 text-sm max-w-2xl">
          API documentada em OpenAPI: base{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">https://api.escalecyber.com/v1</code>, autenticação{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">X-API-Key</code>. No painel Cyber, crie um webhook apontando para sua URL e copie o{' '}
          <strong>secret</strong> para a variável <code className="bg-gray-100 px-1 rounded text-xs">WEBHOOK_SECRET</code> no servidor (header{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">X-Webhook-Signature</code> = HMAC-SHA256 do body em hex, como já usado neste projeto).
        </p>

        {cyberLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : (
          <form onSubmit={saveCyber} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL da API</label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.escalecyber.com/v1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Sua chave do painel Cyber"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    title={showKey ? 'Ocultar' : 'Mostrar'}
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            {cyberMessage && (
              <p className={`mt-4 text-sm ${cyberMessage.startsWith('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                {cyberMessage}
              </p>
            )}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={cyberSaving || !apiKey.trim()}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {cyberSaving ? 'Salvando...' : 'Salvar Cyber Payment'}
              </button>
              {cyberSaved && <span className="text-green-600 text-sm font-medium">Salvo!</span>}
            </div>
          </form>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-xl">
          <p className="text-sm text-amber-800">
            <strong>Webhook:</strong> URL{' '}
            <code className="bg-amber-100 px-1 rounded">https://seu-dominio.com/api/payments/webhook</code>
            . Inclua o evento <code className="bg-amber-100 px-1 rounded">pix.in.confirmation</code>.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-10 space-y-4">
        <h3 className="text-xl font-bold text-gray-900">SarrixPay</h3>
        <p className="text-gray-600 text-sm max-w-2xl">
          API pública <code className="bg-gray-100 px-1 rounded text-xs">https://apiv1.sarrixpay.com</code>: obtenha{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">client_id</code> e{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">client_secret</code> no painel SarrixPay. Registre a URL de webhook no painel do cliente (não por requisição). Se o painel permitir um secret compartilhado, use o mesmo valor em{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">WEBHOOK_SECRET</code> no servidor.
        </p>

        {sarrixLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : (
          <form onSubmit={saveSarrix} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL da API</label>
                <input
                  type="url"
                  value={sarrixBaseUrl}
                  onChange={(e) => setSarrixBaseUrl(e.target.value)}
                  placeholder="https://apiv1.sarrixpay.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={sarrixClientId}
                  onChange={(e) => setSarrixClientId(e.target.value)}
                  placeholder="UUID do integrador"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <div className="relative">
                  <input
                    type={showSarrixSecret ? 'text' : 'password'}
                    value={sarrixSecret}
                    onChange={(e) => setSarrixSecret(e.target.value)}
                    placeholder="cs_live_…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSarrixSecret((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    title={showSarrixSecret ? 'Ocultar' : 'Mostrar'}
                  >
                    {showSarrixSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            {sarrixMessage && (
              <p className={`mt-4 text-sm ${sarrixMessage.startsWith('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                {sarrixMessage}
              </p>
            )}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={sarrixSaving || !sarrixClientId.trim() || !sarrixSecret.trim()}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {sarrixSaving ? 'Salvando...' : 'Salvar SarrixPay'}
              </button>
              {sarrixSaved && <span className="text-green-600 text-sm font-medium">Salvo!</span>}
            </div>
          </form>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-xl">
          <p className="text-sm text-amber-800">
            <strong>Webhook SarrixPay:</strong> qualquer uma:{' '}
            <code className="bg-amber-100 px-1 rounded">/api/webhooks/sarrix</code>,{' '}
            <code className="bg-amber-100 px-1 rounded">/webhooks/sarrix</code> (sem <code className="bg-amber-100 px-1 rounded">/api</code>) ou{' '}
            <code className="bg-amber-100 px-1 rounded">/api/payments/webhook</code>. Evento:{' '}
            <code className="bg-amber-100 px-1 rounded">pix_in.succeeded</code>.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-10">
        <XGateCredentialsManager />
      </div>

      <div className="border-t border-gray-200 pt-10">
        <GateboxCredentialsManager />
      </div>
    </div>
  )
}
