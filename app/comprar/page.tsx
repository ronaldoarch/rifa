'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Minus, Plus, QrCode } from 'lucide-react'

function PurchaseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quantity, setQuantity] = useState(10)
  const [showPixCode, setShowPixCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pixQrCode, setPixQrCode] = useState<string>('')
  const [pixCopyPaste, setPixCopyPaste] = useState<string>('')
  const [raffleId, setRaffleId] = useState<string>('')
  const [ticketPrice, setTicketPrice] = useState(19.95)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setUserId(data.user?.id ?? null))
      .catch(() => setUserId(null))
  }, [])

  useEffect(() => {
    const qty = searchParams.get('quantity')
    const raffle = searchParams.get('raffleId')
    if (qty) {
      const n = parseInt(qty, 10)
      if (!isNaN(n)) setQuantity(n)
    }
    if (raffle) {
      setRaffleId(raffle)
      // Preço será atualizado se tivermos que buscar a rifa
    }
  }, [searchParams])

  // Carregar rifa: quando não há raffleId na URL usa a rifa principal; senão busca preço da rifa da URL
  useEffect(() => {
    const fromUrl = searchParams.get('raffleId')
    let cancelled = false
    if (fromUrl) {
      fetch(`/api/raffles/${fromUrl}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (cancelled || !data) return
          const price = Number(data.ticketPrice)
          if (Number.isFinite(price)) setTicketPrice(price)
          const minPurchase = data.minPurchaseAmount != null ? Number(data.minPurchaseAmount) : 0
          if (minPurchase > 0 && price > 0) {
            setQuantity((q) => Math.max(q, Math.ceil(minPurchase / price)))
          }
        })
        .catch(() => {})
      return () => { cancelled = true }
    }
    fetch('/api/raffles/principal')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.id) return
        setRaffleId(data.id)
        const price = Number(data.ticketPrice)
        if (Number.isFinite(price)) setTicketPrice(price)
        const minPurchase = data.minPurchaseAmount != null ? Number(data.minPurchaseAmount) : 0
        if (minPurchase > 0 && price > 0) {
          setQuantity((q) => Math.max(q, Math.ceil(minPurchase / price)))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [searchParams])

  const totalPrice = ticketPrice * quantity
  const discount = quantity >= 15 ? totalPrice * 0.16 : 0
  const finalPrice = totalPrice - discount

  const handlePurchase = async () => {
    if (!raffleId) {
      toast.info('Aguarde, carregando a rifa...')
      return
    }
    // Track purchase event with UTMfy
    if (typeof window !== 'undefined' && (window as any).utmify) {
      (window as any).utmify.track('purchase_initiated', {
        payment_method: 'pix',
        quantity,
        amount: finalPrice,
      })
    }

    setLoading(true)
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          raffleId: raffleId,
          quantity,
          paymentMethod: 'pix',
        }),
      })

      if (response.status === 401) {
        router.push('/login?redirect=' + encodeURIComponent('/comprar?raffleId=' + raffleId + '&quantity=' + quantity))
        return
      }

      if (response.ok) {
        const data = await response.json()
        setPixQrCode(data.payment.pixQrCode || '')
        setPixCopyPaste(data.payment.pixCopyPaste || '')
        setShowPixCode(true)

        if (typeof window !== 'undefined' && (window as any).utmify) {
          (window as any).utmify.track('pix_qr_generated', {
            payment_id: data.payment.id,
            amount: finalPrice,
          })
        }
      } else {
        toast.error('Erro ao gerar pagamento PIX')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Finalizar Compra</h1>

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
                  <div className="w-full p-4 border-2 border-green-600 bg-green-50 rounded-lg flex items-center space-x-3">
                    <QrCode size={24} className="text-green-600" />
                    <div className="text-left">
                      <div className="font-bold text-green-600">PIX</div>
                      <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - PIX QR Code or Payment button */}
            <div className="space-y-6">
              {showPixCode ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Escaneie o QR Code</h3>
                  {pixQrCode ? (
                    <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                        toast.success('Código PIX copiado!')
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
                    onClick={() => setShowPixCode(false)}
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
                    {loading ? 'Processando...' : 'Gerar QR Code PIX'}
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

