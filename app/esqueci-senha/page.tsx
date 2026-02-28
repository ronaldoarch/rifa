'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar')
        setSubmitting(false)
        return
      }
      setSent(true)
      if (data.resetLink) {
        console.log('Link (dev):', data.resetLink)
      }
    } catch (_) {
      setError('Erro de conexão. Tente de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Esqueci minha senha
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Informe o e-mail da sua conta. Enviaremos um link para redefinir a senha.
          </p>

          {sent ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
              <p className="font-medium">{sent && 'Verifique seu e-mail.'}</p>
              <p className="text-sm mt-1">
                Se o e-mail existir em nossa base, você receberá um link (válido por 1 hora).
              </p>
              <Link href="/login" className="inline-block mt-4 text-yellow-600 hover:underline font-medium">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-yellow-400 text-gray-800 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>
              <p className="text-sm text-gray-600 mt-4 text-center">
                <Link href="/login" className="text-yellow-600 hover:underline font-medium">
                  Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
