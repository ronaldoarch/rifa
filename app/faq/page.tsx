import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Perguntas frequentes',
  description: 'Respostas para as dúvidas mais comuns sobre a plataforma.',
}

const faqs = [
  {
    pergunta: 'Como funciona a compra de cotas?',
    resposta: 'Você escolhe a rifa, a quantidade de cotas e finaliza o pagamento via PIX. Após a confirmação do pagamento, suas cotas são atribuídas e você concorre ao prêmio.',
  },
  {
    pergunta: 'Quando acontece o sorteio?',
    resposta: 'Cada rifa possui data de início e fim. O sorteio é realizado após o encerramento, e o resultado é divulgado na página de Resultados.',
  },
  {
    pergunta: 'Como recebo o prêmio se ganhar?',
    resposta: 'Entraremos em contato pelos dados cadastrados (e-mail e telefone). O prêmio é pago conforme as regras da rifa e da legislação vigente.',
  },
  {
    pergunta: 'Posso cancelar uma compra?',
    resposta: 'Em caso de arrependimento, entre em contato pelo canal de atendimento antes da confirmação do pagamento. Após a confirmação, não é possível cancelar.',
  },
  {
    pergunta: 'Os sorteios são legais?',
    resposta: 'Sim. Nossos sorteios são lastreados por Títulos de Capitalização da Modalidade Incentivo, emitidos por instituição autorizada e registrados na SUSEP.',
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-yellow-400 py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <Link href="/sobre" className="text-gray-800/70 hover:text-gray-800 text-sm mb-2 inline-block">
              ← Voltar ao Sobre
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Perguntas frequentes</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 mb-8">
              Encontre respostas para as dúvidas mais comuns sobre nossa plataforma.
            </p>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-5"
                >
                  <h2 className="text-lg font-bold text-gray-800 mb-2">{faq.pergunta}</h2>
                  <p className="text-gray-600">{faq.resposta}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-gray-600">
              Não encontrou sua dúvida?{' '}
              <Link href="/contato" className="text-green-600 hover:text-green-700 font-medium">
                Entre em contato
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
