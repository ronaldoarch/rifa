'use client'

import { useState, useEffect } from 'react'
import { Save, Check, Upload, Image as ImageIcon } from 'lucide-react'

export default function SettingsManager() {
  const [config, setConfig] = useState({
    platformName: 'PIX DO JONATHAN',
    scrollBannerText: 'CONCORRA A 10 MIL REAIS HOJE!',
    gtmId: '',
    metaPixelId: '',
    whatsapp: '',
    primaryColor: '#FFD700',
    secondaryColor: '#2d5016',
    textColor: '#111827',
    backgroundColor: '#ffffff',
    principalRaffleId: '',
    heroTitle: '5 MILHÕES',
    heroSubtitle: 'EM PRÊMIOS',
    heroDescription: 'Acumule pontos, troque por vantagens e concorra a grandes prêmios',
    logoUrl: '',
    dailyPrizesSectionTitle: 'Premios todos os dias',
  })
  const [raffles, setRaffles] = useState<{ id: string; title: string; status: string }[]>([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
    fetchRaffles()
  }, [])

  const [uploadingLogo, setUploadingLogo] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', 'logo')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setConfig((c) => ({ ...c, logoUrl: data.url }))
      else alert(data.error || 'Erro no upload')
    } catch {
      alert('Erro ao enviar logo')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const fetchRaffles = async () => {
    try {
      const res = await fetch('/api/admin/raffles')
      const data = await res.json()
      setRaffles(Array.isArray(data) ? data : [])
    } catch {
      setRaffles([])
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config')
      const data = await response.json()
      setConfig({
        platformName: data.PLATFORM_NAME || 'PIX DO JONATHAN',
        scrollBannerText: data.SCROLL_BANNER_TEXT || 'CONCORRA A 10 MIL REAIS HOJE!',
        gtmId: data.GTM_ID || '',
        metaPixelId: data.META_PIXEL_ID || '',
        whatsapp: data.WHATSAPP || '',
        primaryColor: data.PRIMARY_COLOR || '#FFD700',
        secondaryColor: data.SECONDARY_COLOR || '#2d5016',
        textColor: data.TEXT_COLOR || '#111827',
        backgroundColor: data.BACKGROUND_COLOR || '#ffffff',
        principalRaffleId: data.PRINCIPAL_RAFFLE_ID || '',
        heroTitle: data.HERO_TITLE || '5 MILHÕES',
        heroSubtitle: data.HERO_SUBTITLE || 'EM PRÊMIOS',
        heroDescription: data.HERO_DESCRIPTION || 'Acumule pontos, troque por vantagens e concorra a grandes prêmios',
        logoUrl: data.LOGO_URL || '',
        dailyPrizesSectionTitle: data.DAILY_PRIZES_SECTION_TITLE || 'Premios todos os dias',
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
          PLATFORM_NAME: config.platformName,
          SCROLL_BANNER_TEXT: config.scrollBannerText,
          GTM_ID: config.gtmId,
          META_PIXEL_ID: config.metaPixelId,
          WHATSAPP: config.whatsapp,
          PRIMARY_COLOR: config.primaryColor,
          SECONDARY_COLOR: config.secondaryColor,
          TEXT_COLOR: config.textColor,
          BACKGROUND_COLOR: config.backgroundColor,
          PRINCIPAL_RAFFLE_ID: config.principalRaffleId,
          HERO_TITLE: config.heroTitle,
          HERO_SUBTITLE: config.heroSubtitle,
          HERO_DESCRIPTION: config.heroDescription,
          LOGO_URL: config.logoUrl,
          DAILY_PRIZES_SECTION_TITLE: config.dailyPrizesSectionTitle,
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Configurações</h2>
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Nome da plataforma
            </label>
            <input
              type="text"
              value={config.platformName}
              onChange={(e) =>
                setConfig({ ...config, platformName: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="PIX DO JONATHAN"
            />
            <p className="text-sm text-gray-500 mt-1">
              Nome exibido no header, footer, admin e título do site
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Logo do site
            </label>
            <div className="flex flex-wrap items-start gap-4">
              {config.logoUrl ? (
                <div className="flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.logoUrl}
                    alt="Logo"
                    className="h-16 object-contain border border-gray-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, logoUrl: '' }))}
                    className="text-sm text-red-600 mt-1"
                  >
                    Remover logo
                  </button>
                </div>
              ) : (
                <div className="h-16 w-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50">
                  <ImageIcon className="text-gray-400" size={28} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-gray-700 font-medium">
                  <Upload size={18} />
                  {uploadingLogo ? 'Enviando...' : 'Enviar logo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </label>
                <input
                  type="text"
                  value={config.logoUrl}
                  onChange={(e) => setConfig((c) => ({ ...c, logoUrl: e.target.value }))}
                  className="mt-2 w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="Ou cole a URL da imagem (ex: https://... ou /uploads/logo/arquivo.jpg)"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Exibida no header ao lado do nome da plataforma. Máx. 5MB (JPEG, PNG, GIF, WebP).
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Texto do banner rolante
            </label>
            <input
              type="text"
              value={config.scrollBannerText}
              onChange={(e) =>
                setConfig({ ...config, scrollBannerText: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="CONCORRA A 10 MIL REAIS HOJE!"
            />
            <p className="text-sm text-gray-500 mt-1">
              Mensagem que aparece na faixa azul em rotação no topo da página inicial
            </p>
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-800">Textos do banner principal (hero)</h3>
            <p className="text-sm text-gray-500 -mt-2">
              Título e frase exibidos no banner verde do topo da página inicial
            </p>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Título (destaque em amarelo)</label>
              <input
                type="text"
                value={config.heroTitle}
                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                placeholder="5 MILHÕES"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Subtítulo (ao lado das linhas)</label>
              <input
                type="text"
                value={config.heroSubtitle}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                placeholder="EM PRÊMIOS"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Descrição (texto abaixo)</label>
              <input
                type="text"
                value={config.heroDescription}
                onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                placeholder="Acumule pontos, troque por vantagens e concorra a grandes prêmios"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Título da seção &quot;Prêmios todos os dias&quot;
            </label>
            <input
              type="text"
              value={config.dailyPrizesSectionTitle}
              onChange={(e) =>
                setConfig({ ...config, dailyPrizesSectionTitle: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="Premios todos os dias"
            />
            <p className="text-sm text-gray-500 mt-1">
              Título da seção com vídeos e fotos de prêmios na página inicial
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Rifa principal (bloco de compra no topo da página)
            </label>
            <select
              value={config.principalRaffleId}
              onChange={(e) =>
                setConfig({ ...config, principalRaffleId: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
            >
              <option value="">Nenhuma (usar preço padrão)</option>
              {raffles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} {r.status ? `(${r.status})` : ''}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              A rifa escolhida aparece no quadro verde de compra no topo da página inicial
            </p>
          </div>

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
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: config.primaryColor }}
                  title={config.primaryColor}
                />
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, primaryColor: e.target.value })
                  }
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0 p-0.5 bg-white"
                  title="Clique para escolher a cor"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, primaryColor: e.target.value })
                  }
                  className="flex-1 min-w-0 px-4 py-2 border rounded-lg text-gray-900 font-mono"
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
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: config.secondaryColor }}
                  title={config.secondaryColor}
                />
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, secondaryColor: e.target.value })
                  }
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0 p-0.5 bg-white"
                  title="Clique para escolher a cor"
                />
                <input
                  type="text"
                  value={config.secondaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, secondaryColor: e.target.value })
                  }
                  className="flex-1 min-w-0 px-4 py-2 border rounded-lg text-gray-900 font-mono"
                  placeholder="#2d5016"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Cor secundária da marca (fundo, elementos secundários)
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Cor das letras (texto geral)
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: config.textColor }}
                  title={config.textColor}
                />
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) =>
                    setConfig({ ...config, textColor: e.target.value })
                  }
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0 p-0.5 bg-white"
                  title="Clique para escolher a cor"
                />
                <input
                  type="text"
                  value={config.textColor}
                  onChange={(e) =>
                    setConfig({ ...config, textColor: e.target.value })
                  }
                  className="flex-1 min-w-0 px-4 py-2 border rounded-lg text-gray-900 font-mono"
                  placeholder="#111827"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Cor padrão do texto no site
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Cor de fundo (página)
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: config.backgroundColor }}
                  title={config.backgroundColor}
                />
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    setConfig({ ...config, backgroundColor: e.target.value })
                  }
                  className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0 p-0.5 bg-white"
                  title="Clique para escolher a cor"
                />
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    setConfig({ ...config, backgroundColor: e.target.value })
                  }
                  className="flex-1 min-w-0 px-4 py-2 border rounded-lg text-gray-900 font-mono"
                  placeholder="#ffffff"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Cor de fundo principal das páginas
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

