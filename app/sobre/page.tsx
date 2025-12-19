import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800">O Pix do Jonathan</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Perguntas frequentes</h2>
              <p className="text-gray-600 mb-4">
                Encontre respostas para as dúvidas mais comuns sobre nossa plataforma.
              </p>
              <Link
                href="/faq"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Ver perguntas frequentes →
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Termos de uso</h2>
              <p className="text-gray-600 mb-4">
                Leia nossos termos e condições de uso da plataforma.
              </p>
              <Link
                href="/termos"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Ler termos de uso →
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Regulamento</h2>
              <p className="text-gray-600 mb-4">
                Consulte o regulamento completo dos sorteios e premiações.
              </p>
              <Link
                href="/regulamento"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Ver regulamento →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

