'use client'

export default function ScrollBanner() {
  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden">
      <div className="animate-scroll whitespace-nowrap">
        <span className="inline-block mr-8">
          CONCORRA A 10 MIL REAIS HOJE! • CONCORRA A 10 MIL REAIS HOJE! • CONCORRA A 10 MIL REAIS HOJE! •{' '}
        </span>
        <span className="inline-block mr-8">
          CONCORRA A 10 MIL REAIS HOJE! • CONCORRA A 10 MIL REAIS HOJE! • CONCORRA A 10 MIL REAIS HOJE! •{' '}
        </span>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

