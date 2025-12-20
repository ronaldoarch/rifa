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

const RafflesManager = dynamic(() => import('@/components/admin/RafflesManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const PromotionsManager = dynamic(() => import('@/components/admin/PromotionsManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const WinnersManager = dynamic(() => import('@/components/admin/WinnersManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const UsersManager = dynamic(() => import('@/components/admin/UsersManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const PaymentsManager = dynamic(() => import('@/components/admin/PaymentsManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const AffiliatesManager = dynamic(() => import('@/components/admin/AffiliatesManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const SettingsManager = dynamic(() => import('@/components/admin/SettingsManager'), {
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
              <RafflesManager />
            </div>
          )}

          {activeTab === 'promotions' && (
            <div>
              <PromotionsManager />
            </div>
          )}

          {activeTab === 'winners' && (
            <div>
              <WinnersManager />
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <UsersManager />
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <PaymentsManager />
            </div>
          )}

          {activeTab === 'affiliates' && (
            <div>
              <AffiliatesManager />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <SettingsManager />
            </div>
          )}
        </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
