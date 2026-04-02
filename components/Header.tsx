'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Menu, X } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const [platformName, setPlatformName] = useState('PIX DO JONATHAN')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.platformName) setPlatformName(data.platformName)
        if (data.logoUrl) setLogoUrl(data.logoUrl)
      })
      .catch(() => {})
  }, [])

  const fetchUser = () => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null))
  }

  useEffect(() => {
    fetchUser()
  }, [pathname])

  useEffect(() => {
    const onSsoLogin = () => fetchUser()
    window.addEventListener('sso-login', onSsoLogin)
    return () => window.removeEventListener('sso-login', onSsoLogin)
  }, [])

  const navItems = [
    { href: '/', label: 'Início' },
    { href: '/resultados', label: 'Resultados' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/contato', label: 'Contato' },
  ]

  return (
    <>
      <div className="bg-gray-800 h-1"></div>
      <header className="bg-site-primary shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={platformName}
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain"
                />
              ) : null}
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                {platformName}
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm xl:text-base text-black font-medium hover:text-gray-700 transition-colors ${
                    pathname === item.href
                      ? 'border-b-2 border-black pb-1'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile: botão menu + usuário */}
            <div className="lg:hidden flex items-center gap-2">
              {user ? (
                <Link
                  href="/perfil"
                  className="p-2 rounded-lg hover:bg-black/10 text-black"
                  aria-label="Perfil"
                >
                  <User size={22} />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800"
                >
                  Entrar
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 rounded-lg hover:bg-black/10 text-black"
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop: User Button */}
            {user ? (
              <Link
                href="/perfil"
                className="hidden lg:flex items-center space-x-2 bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                <User size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden md:inline truncate max-w-[140px]">{user.name}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden lg:flex items-center space-x-2 bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                <User size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden md:inline">entre ou cadastre-se</span>
              </Link>
            )}
          </div>

          {/* Mobile menu dropdown */}
          {menuOpen && (
            <nav className="lg:hidden border-t border-black/10 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-2 py-2.5 rounded-lg text-black font-medium hover:bg-black/10 ${
                    pathname === item.href ? 'bg-black/10' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  )
}

