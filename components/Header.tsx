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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-black">
                PIX DO JONATHAN
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-black font-medium hover:text-gray-700 transition-colors ${
                    pathname === item.href
                      ? 'border-b-2 border-black pb-1'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Button */}
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <User size={20} />
              <span className="hidden sm:inline">entre ou cadastre-se</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}

