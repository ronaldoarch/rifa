'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  DollarSign, 
  Image, 
  Gift,
  Settings,
  BarChart3,
  Tag
} from 'lucide-react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/admin/ErrorBoundary'

// Lazy load components to prevent SSR issues
const Dashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const BannersManager = dynamic(() => import('@/components/admin/BannersManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'raffles', label: 'Rifas', icon: Ticket },
    { id: 'promotions', label: 'Promoções', icon: Tag },
    { id: 'winners', label: 'Ganhadores', icon: Gift },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'payments', label: 'Pagamentos', icon: DollarSign },
    { id: 'affiliates', label: 'Afiliados', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white min-h-screen fixed left-0 top-0 bottom-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold">PIX DO JONATHAN</h1>
            <p className="text-gray-400 text-sm mt-2">Painel Administrativo</p>
          </div>
          <nav className="mt-8">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 hover:bg-gray-700 transition-colors ${
                    activeTab === item.id ? 'bg-gray-700 border-l-4 border-yellow-400' : ''
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64 p-8 text-gray-900">
          {activeTab === 'dashboard' && (
            <div>
              <Dashboard />
            </div>
          )}
          
          {activeTab === 'banners' && (
            <div>
              <BannersManager />
            </div>
          )}

          {activeTab === 'raffles' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Gerenciar Rifas</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Nova Rifa
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Gerenciar Promoções</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Nova Promoção
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'winners' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Gerenciar Ganhadores</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-4">Adicionar vídeo de ganhador:</p>
                <input
                  type="file"
                  accept="video/*"
                  className="mb-4"
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Upload
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Usuários</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Pagamentos</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'affiliates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Afiliados</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Novo Afiliado
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Configurações</h2>
              <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Meta Pixel ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="YOUR_PIXEL_ID"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    WhatsApp de Contato
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="5511999999999"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Cor Principal (Hex)
                  </label>
                  <input
                    type="color"
                    className="w-full h-12 border rounded-lg"
                    defaultValue="#FFD700"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Cor Secundária (Hex)
                  </label>
                  <input
                    type="color"
                    className="w-full h-12 border rounded-lg"
                    defaultValue="#2d5016"
                  />
                </div>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}
        </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
