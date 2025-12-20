import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <CheckCircle size={80} className="text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Compra Realizada com Sucesso!
          </h1>
          <p className="text-gray-600 mb-8">
            Seus tickets foram gerados e estão disponíveis em sua conta.
          </p>
          <div className="space-y-4">
            <Link
              href="/"
              className="block bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Voltar para Home
            </Link>
            <Link
              href="/resultados"
              className="block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              Ver Resultados
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

