'use client'

import { useEffect } from 'react'
import { fetchSiteConfigJson } from '@/lib/site-config-fetch'

export default function ThemeInjector() {
  useEffect(() => {
    fetchSiteConfigJson()
      .then((res) => res.json())
      .then((data) => {
        const root = document.documentElement
        if (data.primaryColor) root.style.setProperty('--site-primary', data.primaryColor)
        if (data.secondaryColor) root.style.setProperty('--site-secondary', data.secondaryColor)
        if (data.textColor) root.style.setProperty('--site-text', data.textColor)
        if (data.backgroundColor) root.style.setProperty('--site-bg', data.backgroundColor)
      })
      .catch(() => {})
  }, [])

  return null
}
