'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { utmfy } from '@/lib/utmfy'

export default function UTMTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get UTM parameters from URL
    const params = utmfy.getParamsFromURL()

    // If there are UTM params in URL, store them
    if (Object.keys(params).length > 0) {
      utmfy.store(params)
    }

    // Track page view with UTM data
    utmfy.trackPageView({
      page_path: pathname,
      page_location: typeof window !== 'undefined' ? window.location.href : pathname,
    })
  }, [pathname, searchParams])

  return null
}

