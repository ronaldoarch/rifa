import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Jogo Responsável',
  description: 'Informações sobre jogo responsável e prevenção.',
}

export default function JogoResponsavelPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <Link href="/sobre" className="text-gray-800/70 hover:text-gray-800 text-sm mb-2 inline-block">
              ← Voltar ao Sobre
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Jogo Responsável</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <p className="text-gray-600 mb-6">
              Acreditamos em uma participação consciente. Nossos sorteios são uma forma de entretenimento
              e não devem comprometer suas finanças ou bem-estar.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Participe com consciência</h2>
              <p className="text-gray-600">
                Estabeleça um limite de gastos e não ultrapasse. Não participe com dinheiro necessário
                para despesas essenciais. Nossos sorteios são lastreados por títulos de capitalização
                da modalidade incentivo, regulamentados pela SUSEP.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Idade mínima</h2>
              <p className="text-gray-600">
                A participação é permitida apenas para maiores de 18 anos. O cadastro e as transações
                estão sujeitos à verificação quando necessário.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Precisa de ajuda?</h2>
              <p className="text-gray-600">
                Se você ou alguém que conhece tem dificuldade em controlar gastos com jogos ou apostas,
                procure orientação. No Brasil, você pode contatar a Ouvidoria da ViaCap (0800 874 1505)
                ou buscar apoio em órgãos especializados.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
