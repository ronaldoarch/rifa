'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function LoginForm() {
  const searchParams = useSearchParams()
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const reason = searchParams.get('reason')
  const reasonMessage =
    reason === 'not_admin'
      ? 'Esta conta não tem permissão de administrador. Peça a um admin para promover o seu usuário ou execute o SQL no banco (ver SECURITY.md).'
      : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const cpfClean = cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      setError('CPF deve ter 11 dígitos.')
      setSubmitting(false)
      return
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cpf: cpfClean, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao entrar')
        setSubmitting(false)
        return
      }
      const next = searchParams.get('redirect') || searchParams.get('next') || '/comprar'
      const wantsAdmin = next === '/admin' || next.startsWith('/admin')
      if (wantsAdmin && data.user?.role !== 'admin') {
        setError(
          'Esta conta não tem permissão de administrador. Um admin deve promover o seu usuário no banco (role = admin) — ver SECURITY.md.'
        )
        setSubmitting(false)
        return
      }
      router.push(next)
    } catch (_) {
      setError('Erro de conexão. Tente de novo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
            Olá, boas vindas!
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-center">
            Identifique-se usando seu CPF
          </p>
          
          {reasonMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm">
              {reasonMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cpf" className="block text-gray-700 font-medium mb-2">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="Apenas números (11 dígitos)"
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <p className="mt-1 text-right">
                <Link href="/esqueci-senha" className="text-sm text-yellow-600 hover:underline">
                  Esqueci minha senha
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-400 text-gray-800 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="text-yellow-600 hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>

          <p className="text-sm text-gray-500 mt-8 text-center">
            Este site é protegido por serviços de verificação de segurança.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md text-center text-gray-500">Carregando...</div>
        </main>
        <Footer />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

