'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ResultsPage() {
  const categories = [
    {
      id: 'pix-do-milhao',
      title: 'Pix do Milhão',
      description: 'Sorteios da Modalidade Incentivo',
      icon: '🎯',
    },
    {
      id: 'terca-premiada',
      title: 'Terça Premiada',
      description: 'Toda terça R$ 40 mil para transformar sua semana 🍀',
      icon: '🏆',
    },
    {
      id: 'sexta-alegria',
      title: 'Sexta da Alegria',
      description: 'Toda sexta tem R$ 50 mil esperando por você 😉',
      icon: '🎉',
    },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-black">Resultados</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <p className="text-gray-700 mb-8">
            Selecione uma categoria abaixo para visualizar os resultados dos sorteios.
          </p>

          <div className="space-y-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/resultados/${category.id}`}
                className="block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center text-3xl">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {category.title}
                      </h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

