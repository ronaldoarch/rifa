'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  DollarSign, 
  Image, 
  Gift,
  Settings,
  BarChart3,
  Tag,
  Video,
  Award,
  Key,
  Menu,
  X
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

const PremiumNumbersManager = dynamic(() => import('@/components/admin/PremiumNumbersManager'), {
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

const XGateCredentialsManager = dynamic(() => import('@/components/admin/XGateCredentialsManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

const ShowcaseManager = dynamic(() => import('@/components/admin/ShowcaseManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
})

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [platformName, setPlatformName] = useState('PIX DO JONATHAN')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.PLATFORM_NAME) setPlatformName(data.PLATFORM_NAME)
      })
      .catch(() => {})
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'raffles', label: 'Rifas', icon: Ticket },
    { id: 'promotions', label: 'Promoções', icon: Tag },
    { id: 'showcase', label: 'Prêmios todos os dias', icon: Video },
    { id: 'winners', label: 'Ganhadores', icon: Gift },
    { id: 'premium-numbers', label: 'Bilhetes premiados', icon: Award },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'payments', label: 'Pagamentos', icon: DollarSign },
    { id: 'affiliates', label: 'Afiliados', icon: BarChart3 },
    { id: 'xgate', label: 'XGate (PIX)', icon: Key },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  const closeSidebar = () => setSidebarOpen(false)
  const selectTab = (id: string) => {
    setActiveTab(id)
    setSidebarOpen(false)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
        {/* Top bar mobile: hamburger para abrir menu */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-gray-800 text-white flex items-center justify-between px-4 shadow">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-700"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold truncate max-w-[180px]">{platformName}</span>
          <div className="w-10" />
        </div>

        {/* Backdrop mobile: fecha o drawer ao clicar fora */}
        {sidebarOpen && (
          <button
            type="button"
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={closeSidebar}
            aria-label="Fechar menu"
          />
        )}

        {/* Sidebar: drawer no mobile, fixo no desktop */}
        <aside
          className={`
            w-64 bg-gray-800 text-white min-h-screen fixed left-0 top-0 bottom-0 z-50
            transform transition-transform duration-200 ease-out
            md:translate-x-0 md:block
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{platformName}</h1>
              <p className="text-gray-400 text-sm mt-2">Painel Administrativo</p>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700"
              aria-label="Fechar menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="mt-8">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id)}
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
        <main className="flex-1 md:ml-64 pt-14 md:pt-0 p-4 sm:p-6 md:p-8 text-gray-900 min-w-0 overflow-x-auto">
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

          {activeTab === 'showcase' && (
            <div>
              <ShowcaseManager />
            </div>
          )}

          {activeTab === 'winners' && (
            <div>
              <WinnersManager />
            </div>
          )}

          {activeTab === 'premium-numbers' && (
            <div>
              <PremiumNumbersManager />
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

          {activeTab === 'xgate' && (
            <div>
              <XGateCredentialsManager />
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
