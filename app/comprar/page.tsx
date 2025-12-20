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
  const [loading, setLoading] = useState(false)
  const [pixQrCode, setPixQrCode] = useState<string>('')
  const [pixCopyPaste, setPixCopyPaste] = useState<string>('')
  const [userCredits, setUserCredits] = useState(0)
  const [raffleId, setRaffleId] = useState<string>('')

  useEffect(() => {
    const qty = searchParams.get('quantity')
    const raffle = searchParams.get('raffleId')
    if (qty) {
      setQuantity(parseInt(qty))
    }
    if (raffle) {
      setRaffleId(raffle)
    }
    // TODO: Buscar créditos do usuário logado
    fetchUserCredits()
  }, [searchParams])

  const fetchUserCredits = async () => {
    try {
      // TODO: Implementar endpoint para buscar créditos do usuário
      // const response = await fetch('/api/user/credits')
      // const data = await response.json()
      // setUserCredits(data.credits || 0)
      setUserCredits(0)
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const basePrice = 19.95
  const totalPrice = basePrice * quantity
  const discount = quantity >= 15 ? totalPrice * 0.16 : 0
  const finalPrice = totalPrice - discount

  const handlePurchase = async () => {
    if (paymentMethod === 'pix') {
      setLoading(true)
      try {
        // Criar pagamento via API
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'temp-user-id', // TODO: Pegar do contexto de autenticação
            raffleId: raffleId || 'default-raffle-id',
            quantity,
            paymentMethod: 'pix',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setPixQrCode(data.payment.pixQrCode || '')
          setPixCopyPaste(data.payment.pixCopyPaste || '')
          setShowPixCode(true)
        } else {
          alert('Erro ao gerar pagamento PIX')
        }
      } catch (error) {
        console.error('Error creating payment:', error)
        alert('Erro ao processar pagamento')
      } finally {
        setLoading(false)
      }
    } else {
      // Pagamento com créditos
      if (userCredits < finalPrice) {
        alert('Créditos insuficientes')
        return
      }

      setLoading(true)
      try {
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'temp-user-id', // TODO: Pegar do contexto de autenticação
            raffleId: raffleId || 'default-raffle-id',
            quantity,
            paymentMethod: 'credits',
          }),
        })

        if (response.ok) {
          router.push('/sucesso')
        } else {
          alert('Erro ao processar pagamento com créditos')
        }
      } catch (error) {
        console.error('Error processing credit payment:', error)
        alert('Erro ao processar pagamento')
      } finally {
        setLoading(false)
      }
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
                <h2 className="text-xl font-bold mb-4 text-gray-900">Resumo da Compra</h2>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-900">Quantidade de cotas:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 p-2 rounded hover:bg-gray-300 text-gray-900"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-xl font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-gray-200 p-2 rounded hover:bg-gray-300 text-gray-900"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-gray-900">
                    <span>Subtotal:</span>
                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto (16%):</span>
                      <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t pt-2 text-gray-900">
                    <span>Total:</span>
                    <span>R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              {/* Payment method selection */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Forma de Pagamento</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      paymentMethod === 'pix'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QrCode size={24} className={paymentMethod === 'pix' ? 'text-green-600' : 'text-gray-600'} />
                    <div className="text-left">
                      <div className={`font-bold ${paymentMethod === 'pix' ? 'text-green-600' : 'text-gray-900'}`}>PIX</div>
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
                    <CreditCard size={24} className={paymentMethod === 'credits' ? 'text-green-600' : 'text-gray-600'} />
                    <div className="text-left">
                      <div className={`font-bold ${paymentMethod === 'credits' ? 'text-green-600' : 'text-gray-900'}`}>Créditos da Plataforma</div>
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
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Escaneie o QR Code</h3>
                  {pixQrCode ? (
                    <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                      <img
                        src={pixQrCode}
                        alt="QR Code PIX"
                        className="w-64 h-64"
                      />
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                      <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                        <QrCode size={128} className="text-gray-400" />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">
                    Ou copie e cole o código PIX:
                  </p>
                  <div className="bg-white p-3 rounded border-2 border-dashed mb-4">
                    <code className="text-xs break-all text-gray-900">
                      {pixCopyPaste || 'Gerando código PIX...'}
                    </code>
                  </div>
                  <button
                    onClick={() => {
                      if (pixCopyPaste) {
                        navigator.clipboard.writeText(pixCopyPaste)
                        alert('Código PIX copiado!')
                      }
                    }}
                    disabled={!pixCopyPaste}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copiar código PIX
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Após o pagamento, aguarde a confirmação automática
                  </p>
                  <button
                    onClick={() => {
                      setShowPixCode(false)
                      setPaymentMethod('credits')
                    }}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Alterar forma de pagamento
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Tutorial de Pagamento</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Escaneie o QR Code</p>
                        <p className="text-gray-600">Use o app do seu banco para escanear</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Confirme o pagamento</p>
                        <p className="text-gray-600">Verifique os dados e confirme</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Aguarde a confirmação</p>
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
                    disabled={loading}
                    className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? 'Processando...'
                      : paymentMethod === 'pix'
                      ? 'Gerar QR Code PIX'
                      : 'Pagar com Créditos'}
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

