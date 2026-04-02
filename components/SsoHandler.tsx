'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

/**
 * Detecta token SSO na URL (vindo do JB) e faz login automático.
 */
export default function SsoHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) return

    const processSso = async () => {
      try {
        const res = await fetch('/api/auth/sso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token }),
        })
        const data = await res.json()

        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.toString())

        if (res.ok) {
          window.dispatchEvent(new CustomEvent('sso-login'))
          router.refresh()
          if (pathname === '/login') {
            router.push('/comprar')
          }
        } else {
          toast.error(data.error || 'Não foi possível fazer login automático.')
        }
      } catch {
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.toString())
        toast.error('Erro ao processar login automático.')
      }
    }

    processSso()
  }, [pathname, router])

  return null
}
