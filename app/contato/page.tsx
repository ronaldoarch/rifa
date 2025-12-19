import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800">Contato</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <p className="text-gray-700 mb-8">
              Clique no botão abaixo para entrar em contato com nosso suporte
            </p>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-800 text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              Entrar em contato
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

