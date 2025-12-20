'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Início' },
    { href: '/resultados', label: 'Resultados' },
    { href: '/sobre', label: 'O Pix do Jonathan' },
    { href: '/beneficios', label: 'Clube de Benefícios' },
    { href: '/contato', label: 'Contato' },
  ]

  return (
    <>
      <div className="bg-gray-800 h-1"></div>
      <header className="bg-yellow-400 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                PIX DO JONATHAN
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
            <Link
              href="/login"
              className="hidden sm:flex items-center space-x-2 bg-black text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              <User size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline">entre ou cadastre-se</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}

