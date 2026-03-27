'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Minus, Plus, QrCode, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'

type PaymentState = 'idle' | 'generating' | 'awaiting' | 'paid' | 'error'

/** Igual ao limite em /api/payments/create */
const MAX_QUANTITY_PER_PURCHASE = 500

type RaffleLoadState = 'loading' | 'ready' | 'error'

function PurchaseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quantity, setQuantity] = useState(10)
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [pixCopyPaste, setPixCopyPaste] = useState<string>('')
  const [paymentId, setPaymentId] = useState<string>('')
  const [raffleId, setRaffleId] = useState<string>('')
  const [ticketPrice, setTicketPrice] = useState(19.95)
  const [minQty, setMinQty] = useState(1)
  const [maxQty, setMaxQty] = useState(MAX_QUANTITY_PER_PURCHASE)
  const [availableTickets, setAvailableTickets] = useState<number | null>(null)
  const [raffleLoadState, setRaffleLoadState] = useState<RaffleLoadState>('loading')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  useEffect(() => {
    const qty = searchParams.get('quantity')
    const raffle = searchParams.get('raffleId')
    if (qty) {
      const n = parseInt(qty, 10)
      if (!isNaN(n)) setQuantity(n)
    }
    if (raffle) setRaffleId(raffle)
  }, [searchParams])

  // Carrega dados da rifa (principal ou específica) — preço e estoque vêm do servidor (fonte da verdade)
  useEffect(() => {
    const fromUrl = searchParams.get('raffleId')
    let cancelled = false
    setRaffleLoadState('loading')
    const endpoint = fromUrl ? `/api/raffles/${fromUrl}` : '/api/raffles/principal'
    fetch(endpoint)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled) return
        if (!data?.id) {
          setRaffleLoadState('error')
          return
        }
        if (!fromUrl) setRaffleId(data.id)
        const price = Number(data.ticketPrice)
        if (!Number.isFinite(price) || price <= 0) {
          setRaffleLoadState('error')
          return
        }
        setTicketPrice(price)
        const totalT = Number(data.totalTickets)
        const soldT = Number(data.soldTickets)
        const available = Number.isFinite(totalT) && Number.isFinite(soldT)
          ? Math.max(0, totalT - soldT)
          : 0
        setAvailableTickets(available)
        const maxBuy = Math.min(MAX_QUANTITY_PER_PURCHASE, available)
        setMaxQty(maxBuy)

        const min = data.minPurchaseAmount != null ? Number(data.minPurchaseAmount) : 0
        const mq = min > 0 && price > 0 ? Math.ceil(min / price) : 1
        setMinQty(mq)

        setQuantity((q) => {
          const lo = mq
          if (maxBuy <= 0) return lo
          if (maxBuy < lo) return maxBuy
          return Math.min(Math.max(q, lo), maxBuy)
        })
        setRaffleLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setRaffleLoadState('error')
      })
    return () => { cancelled = true }
  }, [searchParams])

  const totalPrice = ticketPrice * quantity
  const soldOut = availableTickets !== null && availableTickets <= 0
  const belowMinStock =
    raffleLoadState === 'ready' && maxQty > 0 && minQty > maxQty
  const canShowTotals = raffleLoadState === 'ready' && !soldOut && !belowMinStock
  const canPurchase =
    raffleLoadState === 'ready' &&
    !!raffleId &&
    !soldOut &&
    !belowMinStock &&
    maxQty > 0 &&
    quantity >= minQty &&
    quantity <= maxQty

  // Inicia polling para verificar pagamento
  const startPolling = (pmtId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${pmtId}/status`, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'paid') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setPaymentState('paid')
          toast.success('Pagamento confirmado! Seus tickets foram reservados.')
        }
      } catch {
        // ignora erros de rede — continua tentando
      }
    }, 5000)
  }

  const handlePurchase = async () => {
    if (!raffleId || raffleLoadState !== 'ready') {
      toast.info('Aguarde, carregando a rifa...')
      return
    }
    if (soldOut || quantity > maxQty || quantity < minQty) {
      toast.error('Ajuste a quantidade de bilhetes conforme o disponível na rifa.')
      return
    }

    setPaymentState('generating')
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ raffleId, quantity, paymentMethod: 'pix' }),
      })

      if (response.status === 401) {
        router.push('/login?redirect=' + encodeURIComponent('/comprar?raffleId=' + raffleId + '&quantity=' + quantity))
        return
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        toast.error(err.error || 'Erro ao gerar pagamento PIX')
        setPaymentState('idle')
        return
      }

      const data = await response.json()
      const copyPaste: string = data.payment?.pixCopyPaste || ''
      const pmtId: string = data.payment?.id || ''

      if (data.pixError || !copyPaste) {
        // PIX gerado mas sem código (gateway indisponível ou mal configurado)
        toast.error('Não foi possível gerar o QR Code PIX. Verifique as configurações do gateway ou tente novamente.')
        setPaymentState('error')
        return
      }

      setPixCopyPaste(copyPaste)
      setPaymentId(pmtId)
      setPaymentState('awaiting')
      if (pmtId) startPolling(pmtId)

      if (typeof window !== 'undefined' && (window as any).utmify) {
        const paidAmount = typeof data.payment?.amount === 'number' ? data.payment.amount : totalPrice
        ;(window as any).utmify.track('pix_qr_generated', { payment_id: pmtId, amount: paidAmount })
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Erro ao processar pagamento. Tente novamente.')
      setPaymentState('idle')
    }
  }

  const handleRetry = () => {
    setPaymentState('idle')
    setPixCopyPaste('')
    setPaymentId('')
    if (pollingRef.current) clearInterval(pollingRef.current)
  }

  const handleCopy = () => {
    if (!pixCopyPaste) return
    navigator.clipboard.writeText(pixCopyPaste)
      .then(() => toast.success('Código PIX copiado!'))
      .catch(() => toast.error('Não foi possível copiar. Copie manualmente.'))
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

                {raffleLoadState === 'loading' && (
                  <p className="text-sm text-gray-600 mb-4">Carregando preço e disponibilidade…</p>
                )}
                {raffleLoadState === 'error' && (
                  <p className="text-sm text-red-600 mb-4">Não foi possível carregar esta rifa. Atualize a página ou volte mais tarde.</p>
                )}
                {soldOut && raffleLoadState === 'ready' && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    Bilhetes esgotados para esta rifa.
                  </p>
                )}
                {belowMinStock && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    Não há bilhetes suficientes para atingir o valor mínimo de compra desta rifa ({minQty} bilhetes necessários, {maxQty} disponível(is)).
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-900">Quantidade de cotas:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                      disabled={
                        quantity <= minQty ||
                        paymentState !== 'idle' ||
                        raffleLoadState !== 'ready' ||
                        soldOut
                      }
                      className="bg-gray-200 p-2 rounded hover:bg-gray-300 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-xl font-bold text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      disabled={
                        quantity >= maxQty ||
                        paymentState !== 'idle' ||
                        raffleLoadState !== 'ready' ||
                        soldOut
                      }
                      className="bg-gray-200 p-2 rounded hover:bg-gray-300 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                {raffleLoadState === 'ready' && maxQty > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    Máximo nesta compra: {maxQty} (até {MAX_QUANTITY_PER_PURCHASE} por pedido)
                    {minQty > 1 && ` · Mínimo: ${minQty} (valor mínimo da rifa)`}
                  </p>
                )}

                <div className="space-y-2 border-t pt-4">
                  {canShowTotals && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>
                        {quantity} × R$ {ticketPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="font-medium text-gray-900">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t pt-2 text-gray-900">
                    <span>Total:</span>
                    <span>
                      {canShowTotals
                        ? `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Forma de Pagamento</h2>
                <div className="w-full p-4 border-2 border-green-600 bg-green-50 rounded-lg flex items-center space-x-3">
                  <QrCode size={24} className="text-green-600" />
                  <div className="text-left">
                    <div className="font-bold text-green-600">PIX</div>
                    <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="space-y-6">
              {/* PAGO */}
              {paymentState === 'paid' && (
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                  <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Pagamento Confirmado!</h3>
                  <p className="text-green-700 mb-6">Seus tickets foram reservados com sucesso.</p>
                  <button
                    onClick={() => router.push('/minha-conta')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                  >
                    Ver meus tickets
                  </button>
                </div>
              )}

              {/* QR aguardando pagamento */}
              {paymentState === 'awaiting' && (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Escaneie o QR Code</h3>
                  <p className="text-sm text-gray-500 mb-4">Aguardando confirmação do pagamento...</p>
                  <div className="bg-white p-4 rounded-lg mb-4 inline-block shadow">
                    <QRCodeSVG
                      value={pixCopyPaste}
                      size={240}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Ou copie e cole o código PIX:</p>
                  <div className="bg-white p-3 rounded border-2 border-dashed mb-4 text-left">
                    <code className="text-xs break-all text-gray-900">{pixCopyPaste}</code>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors mb-3"
                  >
                    Copiar código PIX
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
                    <RefreshCw size={12} className="animate-spin" />
                    Verificando pagamento automaticamente...
                  </div>
                  <button onClick={handleRetry} className="text-sm text-blue-600 hover:text-blue-700">
                    Gerar novo QR Code
                  </button>
                  <p className="text-xs text-gray-400 mt-3">
                    Após o pagamento PIX o status é atualizado em alguns segundos.
                  </p>
                </div>
              )}

              {/* Erro ao gerar QR */}
              {paymentState === 'error' && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-800 mb-2">Erro ao gerar QR Code</h3>
                  <p className="text-red-700 text-sm mb-6">
                    Não foi possível gerar o código PIX. Por favor, tente novamente ou entre em contato com o suporte.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Idle / generating - tutorial + botão */}
              {(paymentState === 'idle' || paymentState === 'generating') && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Como pagar com PIX</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                      <div>
                        <p className="font-bold text-gray-900">Clique em &quot;Gerar QR Code&quot;</p>
                        <p className="text-gray-600">Um QR Code PIX exclusivo será gerado</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                      <div>
                        <p className="font-bold text-gray-900">Escaneie com o app do seu banco</p>
                        <p className="text-gray-600">Abra o app do banco e leia o QR Code ou cole o código</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                      <div>
                        <p className="font-bold text-gray-900">Confirme o pagamento</p>
                        <p className="text-gray-600">Seus tickets são confirmados automaticamente</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🔒 Pagamento seguro via PIX. Confirmação em segundos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePurchase}
                    disabled={paymentState === 'generating' || !canPurchase}
                    className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {paymentState === 'generating' ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Gerando QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode size={20} />
                        {canShowTotals ? (
                          <>Gerar QR Code PIX — R$ {totalPrice.toFixed(2).replace('.', ',')}</>
                        ) : (
                          <>Gerar QR Code PIX</>
                        )}
                      </>
                    )}
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
