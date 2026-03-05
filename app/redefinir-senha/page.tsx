'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function RedefinirSenhaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tokenFromUrl = searchParams.get('token') ?? ''
  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setToken(tokenFromUrl)
  }, [tokenFromUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (!token.trim()) {
      setError('Link inválido. Use o link que enviamos por e-mail.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha')
        setSubmitting(false)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (_) {
      setError('Erro de conexão. Tente de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!tokenFromUrl && !token) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md text-center">
            <p className="text-gray-600 mb-4">
              Acesse o link que enviamos por e-mail para redefinir sua senha.
            </p>
            <Link href="/esqueci-senha" className="text-yellow-600 hover:underline font-medium">
              Solicitar novo link
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
            Nova senha
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Digite e confirme sua nova senha (mínimo 6 caracteres).
          </p>

          {success ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
              <p className="font-medium">Senha alterada com sucesso!</p>
              <p className="text-sm mt-1">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!tokenFromUrl && (
                  <div>
                    <label htmlFor="token" className="block text-gray-700 font-medium mb-2">
                      Código do e-mail
                    </label>
                    <input
                      type="text"
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Cole o código do e-mail"
                      className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-gray-700 font-medium mb-2">
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    id="confirm"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-yellow-400 text-gray-800 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Redefinir senha'}
                </button>
              </form>
            </>
          )}
          <p className="text-sm text-gray-600 mt-4 text-center">
            <Link href="/login" className="text-yellow-600 hover:underline font-medium">
              Voltar ao login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    }>
      <RedefinirSenhaContent />
    </Suspense>
  )
}
