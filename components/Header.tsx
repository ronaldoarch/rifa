'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const [platformName, setPlatformName] = useState('PIX DO JONATHAN')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.platformName) setPlatformName(data.platformName)
        if (data.logoUrl) setLogoUrl(data.logoUrl)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null))
  }, [pathname])

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

            {/* Mobile Menu Button - TODO: Add mobile menu */}
            <button className="lg:hidden text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* User Button */}
            {user ? (
              <Link
                href="/perfil"
                className="hidden sm:flex items-center space-x-2 bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                <User size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden md:inline truncate max-w-[140px]">{user.name}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center space-x-2 bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                <User size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden md:inline">entre ou cadastre-se</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

