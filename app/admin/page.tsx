'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  DollarSign, 
  Image, 
  Gift,
  Settings,
  BarChart3
} from 'lucide-react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'raffles', label: 'Rifas', icon: Ticket },
    { id: 'winners', label: 'Ganhadores', icon: Gift },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'payments', label: 'Pagamentos', icon: DollarSign },
    { id: 'affiliates', label: 'Afiliados', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white min-h-screen">
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
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Total de Usuários</h3>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Arrecadação Total</h3>
                  <p className="text-3xl font-bold">R$ 0,00</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Rifas Ativas</h3>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Tickets Vendidos</h3>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Gerenciar Banners</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Novo Banner
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Nenhum banner cadastrado</p>
              </div>
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
                <p className="text-gray-600">Nenhuma rifa cadastrada</p>
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
                <p className="text-gray-600">Nenhum usuário cadastrado</p>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Pagamentos</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Nenhum pagamento registrado</p>
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
                <p className="text-gray-600">Nenhum afiliado cadastrado</p>
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
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

