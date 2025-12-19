'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RegisterPage() {
  const [page, setPage] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    useSocialName: false,
    phone: '',
    email: '',
    password: '',
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (page === 1) {
      setPage(2)
    }
  }

  const handlePrevious = () => {
    if (page === 2) {
      setPage(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement registration logic
    router.push('/comprar')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            É sua primeira vez por aqui!
          </h1>
          <p className="text-gray-600 mb-2 text-center">
            Você ainda não tem uma conta conosco. Vamos fazer o seu cadastro?
          </p>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Página {page} de 2
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {page === 1 ? (
              <>
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Seu nome completo
                  </p>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={formData.useSocialName}
                      onChange={(e) => handleInputChange('useSocialName', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Usar Nome Social</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
                    Telefone ou WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Seu número de telefone ou WhatsApp"
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Seu número de telefone ou WhatsApp
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Seu endereço de e-mail"
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Seu endereço de e-mail
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Próximo &gt;
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Sua senha"
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      👁️
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center"
                  >
                    &lt; Anterior
                  </button>
                  <button
                    type="submit"
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center"
                  >
                    Continuar para compra &gt;
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

