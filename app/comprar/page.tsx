'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Minus, Plus, CreditCard, QrCode } from 'lucide-react'

function PurchaseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quantity, setQuantity] = useState(10)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credits'>('pix')
  const [showPixCode, setShowPixCode] = useState(false)

  useEffect(() => {
    const qty = searchParams.get('quantity')
    if (qty) {
      setQuantity(parseInt(qty))
    }
  }, [searchParams])

  const basePrice = 19.95
  const totalPrice = basePrice * quantity
  const discount = quantity >= 15 ? totalPrice * 0.16 : 0
  const finalPrice = totalPrice - discount

  const handlePurchase = () => {
    if (paymentMethod === 'pix') {
      setShowPixCode(true)
      // TODO: Generate PIX QR code
    } else {
      // TODO: Process credit payment
      router.push('/sucesso')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Purchase details */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Resumo da Compra</h2>
                
                <div className="flex items-center justify-between mb-4">
                  <span>Quantidade de cotas:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-xl font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto (16%):</span>
                      <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              {/* Payment method selection */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Forma de Pagamento</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      paymentMethod === 'pix'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QrCode size={24} />
                    <div className="text-left">
                      <div className="font-bold">PIX</div>
                      <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('credits')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      paymentMethod === 'credits'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard size={24} />
                    <div className="text-left">
                      <div className="font-bold">Créditos da Plataforma</div>
                      <div className="text-sm text-gray-600">Saldo disponível: R$ 0,00</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - PIX QR Code or Payment button */}
            <div className="space-y-6">
              {showPixCode && paymentMethod === 'pix' ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-4">Escaneie o QR Code</h3>
                  <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                    <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                      <QrCode size={128} className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Ou copie e cole o código PIX:
                  </p>
                  <div className="bg-white p-3 rounded border-2 border-dashed mb-4">
                    <code className="text-xs break-all">
                      00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865405{finalPrice.toFixed(2)}5802BR5925PIX DO JONATHAN6009SAO PAULO62070503***6304
                    </code>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText('PIX_CODE_HERE')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Copiar código PIX
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Após o pagamento, aguarde a confirmação automática
                  </p>
                  <button
                    onClick={() => setPaymentMethod('credits')}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Alterar forma de pagamento
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Tutorial de Pagamento</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-bold">Escaneie o QR Code</p>
                        <p className="text-gray-600">Use o app do seu banco para escanear</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-bold">Confirme o pagamento</p>
                        <p className="text-gray-600">Verifique os dados e confirme</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-bold">Aguarde a confirmação</p>
                        <p className="text-gray-600">Seu pagamento será processado automaticamente</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🔒 Seus dados estão seguros. Utilizamos criptografia de ponta a ponta para proteger suas transações.
                    </p>
                  </div>

                  <button
                    onClick={handlePurchase}
                    className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                  >
                    {paymentMethod === 'pix' ? 'Gerar QR Code PIX' : 'Pagar com Créditos'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PurchasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <PurchaseContent />
    </Suspense>
  )
}

