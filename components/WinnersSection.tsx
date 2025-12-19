'use client'

export default function WinnersSection() {
  const winners = [
    { name: 'João Silva', prize: 'R$ 1.000,00', image: '/winner1.jpg' },
    { name: 'Maria Santos', prize: 'R$ 500,00', image: '/winner2.jpg' },
    { name: 'Pedro Costa', prize: 'R$ 2.000,00', image: '/winner3.jpg' },
  ]

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Raspou. Achou. É pix!</h2>
        
        {/* Winners gallery */}
        <div className="flex space-x-4 overflow-x-auto pb-4 mb-8">
          {winners.map((winner, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center"
            >
              <span className="text-sm font-medium">{winner.name}</span>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-center mb-8">Confira quem mudou de vida</h3>
        
        {/* Video testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {winners.map((winner, index) => (
            <div key={index} className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-lg">{winner.prize}</p>
                <p className="text-gray-600">{winner.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/resultados" className="text-green-600 hover:text-green-700 font-medium">
            ver mais →
          </a>
        </div>
      </div>
    </div>
  )
}

