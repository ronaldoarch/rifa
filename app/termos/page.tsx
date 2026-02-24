import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Termos de uso',
  description: 'Termos e condições de uso da plataforma.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-8">
          <div className="container mx-auto px-4">
            <Link href="/sobre" className="text-gray-800/70 hover:text-gray-800 text-sm mb-2 inline-block">
              ← Voltar ao Sobre
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Termos de uso</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <p className="text-gray-600 mb-6">
              Leia atentamente os termos e condições de uso da plataforma antes de realizar compras ou cadastros.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Aceitação dos termos</h2>
              <p className="text-gray-600">
                Ao acessar e utilizar esta plataforma, você declara ter lido, entendido e concordado com estes Termos de Uso. 
                O uso dos serviços oferecidos implica a aceitação integral das condições aqui descritas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. Cadastro e responsabilidade</h2>
              <p className="text-gray-600">
                O usuário é responsável por manter seus dados cadastrais atualizados e verdadeiros. 
                É vedado o cadastro por menores de 18 anos. A plataforma reserva-se o direito de 
                suspender ou encerrar contas em caso de irregularidades ou violação destes termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Compras e pagamentos</h2>
              <p className="text-gray-600">
                As compras de cotas estão sujeitas à disponibilidade e às regras específicas de cada rifa. 
                O pagamento via PIX deve ser concluído dentro do prazo informado. Após a confirmação 
                do pagamento pelo provedor, as cotas são creditadas e a participação no sorteio é garantida.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Sorteios e premiação</h2>
              <p className="text-gray-600">
                Os sorteios são realizados conforme regulamento de cada campanha, com base em títulos 
                de capitalização da modalidade incentivo, nos termos da legislação vigente. 
                Os resultados são divulgados na área de Resultados e os ganhadores são contactados 
                pelos canais cadastrados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Privacidade</h2>
              <p className="text-gray-600">
                O tratamento dos dados pessoais está descrito em nossa{' '}
                <Link href="/privacidade" className="text-green-600 hover:text-green-700">
                  Política de Privacidade
                </Link>
                , que integra estes Termos de Uso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">6. Alterações</h2>
              <p className="text-gray-600">
                A plataforma pode alterar estes Termos de Uso a qualquer momento. Alterações 
                significativas serão comunicadas por e-mail ou aviso na própria plataforma. 
                O uso continuado após as alterações constitui aceitação da nova versão.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">7. Contato</h2>
              <p className="text-gray-600">
                Dúvidas sobre estes termos podem ser enviadas pela página de{' '}
                <Link href="/contato" className="text-green-600 hover:text-green-700">
                  Contato
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
