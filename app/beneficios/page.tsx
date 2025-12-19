import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BenefitsPage() {
  const benefits = [
    {
      title: 'Experiências',
      description: 'Troque seus pontos por experiências únicas',
      image: '/benefits/experiences.jpg',
    },
    {
      title: 'Gift Cards',
      description: 'Netflix, Spotify, Amazon e muito mais',
      image: '/benefits/giftcards.jpg',
    },
    {
      title: 'Lojas',
      description: 'Produtos exclusivos da nossa loja',
      image: '/benefits/store.jpg',
    },
    {
      title: 'Benefícios',
      description: 'Descontos e vantagens especiais',
      image: '/benefits/benefits.jpg',
    },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-800">Clube de Benefícios</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600 mb-12">
            Conheça nossos benefícios
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-400 transition-colors"
              >
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">{benefit.title}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="#"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ver mais →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

