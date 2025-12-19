import Link from 'next/link'
import { Instagram, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left side */}
          <div>
            <h3 className="text-2xl font-bold mb-4">PIX DO JONATHAN</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="hover:text-yellow-400 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                <Youtube size={24} />
              </a>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Sorteios lastreados por Títulos de Capitalização, da Modalidade Incentivo, emitidos pela VIA Capitalização SA, inscritos no CNPJ sob nº 88.076.302/0001-94, e aprovados pela SUSEP através do registro na SUSEP Sorteio nº 15414.672014/2025-00 e 15414.672017/2025-35. O valor das premiações aqui indicadas são líquidos, já descontado o devido imposto de renda de 25%. O registro deste plano na SUSEP não implica, por parte da Autarquia, incentivo ou recomendação a suas negociações.
            </p>
            <p className="text-sm text-gray-400 mb-2">Títulos emitidos por:</p>
            <div className="text-white font-bold">Via Cap</div>
          </div>

          {/* Right side */}
          <div className="flex justify-end">
            <div className="bg-white p-4 rounded">
              <div className="text-green-600 font-bold">Google Safe Browsing</div>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="border-t border-gray-700 pt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/termos" className="hover:text-yellow-400">Termos de Uso</Link>
          <Link href="/privacidade" className="hover:text-yellow-400">Política de Privacidade</Link>
          <Link href="/faq" className="hover:text-yellow-400">Perguntas frequentes</Link>
          <Link href="/jogo-responsavel" className="hover:text-yellow-400">Jogo Responsável</Link>
          <Link href="/contato" className="hover:text-yellow-400">Contato</Link>
          <span>Sac ViaCap - (51) 3303-3851</span>
          <span>Ouvidoria ViaCap - 0800 874 1505</span>
          <span>PIX DO JONATHAN - 30.682.309/0001-70</span>
        </div>
      </div>
    </footer>
  )
}

