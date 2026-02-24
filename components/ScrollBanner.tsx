'use client'

import { useState, useEffect } from 'react'

const DEFAULT_TEXT = 'CONCORRA A 10 MIL REAIS HOJE!'

export default function ScrollBanner() {
  const [text, setText] = useState(DEFAULT_TEXT)

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.scrollBannerText && data.scrollBannerText.trim()) {
          setText(data.scrollBannerText.trim())
        }
      })
      .catch(() => {})
  }, [])

  const repeatText = `${text} • `.repeat(10)

  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden">
      <div className="animate-scroll whitespace-nowrap">
        <span className="inline-block mr-8">{repeatText}</span>
        <span className="inline-block mr-8">{repeatText}</span>
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

