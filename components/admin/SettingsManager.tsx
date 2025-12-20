'use client'

import { useState, useEffect } from 'react'
import { Save, Check } from 'lucide-react'

export default function SettingsManager() {
  const [config, setConfig] = useState({
    gtmId: '',
    metaPixelId: '',
    whatsapp: '',
    primaryColor: '#FFD700',
    secondaryColor: '#2d5016',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config')
      const data = await response.json()
      setConfig({
        gtmId: data.GTM_ID || '',
        metaPixelId: data.META_PIXEL_ID || '',
        whatsapp: data.WHATSAPP || '',
        primaryColor: data.PRIMARY_COLOR || '#FFD700',
        secondaryColor: data.SECONDARY_COLOR || '#2d5016',
      })
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          GTM_ID: config.gtmId,
          META_PIXEL_ID: config.metaPixelId,
          WHATSAPP: config.whatsapp,
          PRIMARY_COLOR: config.primaryColor,
          SECONDARY_COLOR: config.secondaryColor,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Erro ao salvar configurações')
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Configurações</h2>
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Google Tag Manager ID
            </label>
            <input
              type="text"
              value={config.gtmId}
              onChange={(e) =>
                setConfig({ ...config, gtmId: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="GTM-XXXXXXX"
            />
            <p className="text-sm text-gray-500 mt-1">
              Configure o ID do seu Google Tag Manager para tracking avançado
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Meta Pixel ID
            </label>
            <input
              type="text"
              value={config.metaPixelId}
              onChange={(e) =>
                setConfig({ ...config, metaPixelId: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="YOUR_PIXEL_ID"
            />
            <p className="text-sm text-gray-500 mt-1">
              Configure o ID do Meta Pixel para campanhas no Facebook/Instagram
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              WhatsApp de Contato
            </label>
            <input
              type="text"
              value={config.whatsapp}
              onChange={(e) =>
                setConfig({ ...config, whatsapp: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="5511999999999"
            />
            <p className="text-sm text-gray-500 mt-1">
              Número do WhatsApp para contato rápido (apenas números, sem caracteres especiais)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Cor Principal
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, primaryColor: e.target.value })
                  }
                  className="w-20 h-12 border rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, primaryColor: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="#FFD700"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Cor principal da marca (botões, destaques)
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Cor Secundária
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, secondaryColor: e.target.value })
                  }
                  className="w-20 h-12 border rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.secondaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, secondaryColor: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="#2d5016"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Cor secundária da marca (fundo, elementos secundários)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {saved && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check size={20} />
                  <span className="font-medium">Configurações salvas com sucesso!</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save size={20} />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

