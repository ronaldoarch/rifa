'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [cpf, setCpf] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement login logic
    router.push('/cadastro')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Olá, boas vindas!
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Identifique-se usando seu CPF
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cpf" className="block text-gray-700 font-medium mb-2">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="Digite o seu CPF"
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Insira o número do seu CPF
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Continuar
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-8 text-center">
            Este site é protegido por serviços de verificação de segurança.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

