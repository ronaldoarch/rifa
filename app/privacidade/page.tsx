import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade',
  description: 'Política de privacidade e tratamento de dados pessoais.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <Link href="/termos" className="text-gray-800/70 hover:text-gray-800 text-sm mb-2 inline-block">
              ← Voltar aos Termos
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Política de Privacidade</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <p className="text-gray-600 mb-6">
              Esta política descreve como tratamos seus dados pessoais ao usar nossa plataforma.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Dados coletados</h2>
              <p className="text-gray-600">
                Coletamos os dados informados no cadastro (nome, CPF, e-mail, telefone) e os dados de
                transação necessários para processar pagamentos e entregar prêmios. O CPF é exigido por
                determinação legal e para emissão de títulos de capitalização.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. Finalidade</h2>
              <p className="text-gray-600">
                Os dados são utilizados para gestão da conta, processamento de compras, comunicação
                sobre sorteios e premiações, cumprimento de obrigações legais e melhoria dos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Compartilhamento</h2>
              <p className="text-gray-600">
                Podemos compartilhar dados com parceiros de pagamento (PIX), instituição emissora dos
                títulos e autoridades quando exigido por lei. Não vendemos seus dados a terceiros.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Seus direitos</h2>
              <p className="text-gray-600">
                Você pode acessar, corrigir ou solicitar a exclusão dos seus dados, na medida permitida
                pela lei. Entre em contato pela página de <Link href="/contato" className="text-green-600 hover:text-green-700">Contato</Link> para exercer seus direitos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Alterações</h2>
              <p className="text-gray-600">
                Esta política pode ser atualizada. Alterações relevantes serão comunicadas na plataforma
                ou por e-mail.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
