// UTMfy - UTM Parameter Tracking
// Captures and stores UTM parameters from URL

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  fbclid?: string
  gclid?: string
  ref?: string
}

export class UTMfy {
  private storageKey = 'utmfy_params'
  private sessionKey = 'utmfy_session'
  private expiryDays = 30

  // Get UTM parameters from URL
  getParamsFromURL(): UTMParams {
    if (typeof window === 'undefined') return {}

    const params = new URLSearchParams(window.location.search)
    const utmParams: UTMParams = {}

    const utmKeys: (keyof UTMParams)[] = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
    ]

    utmKeys.forEach((key) => {
      const value = params.get(key)
      if (value) {
        utmParams[key] = value
      }
    })

    return utmParams
  }

  // Store UTM parameters in localStorage
  store(params: UTMParams): void {
    if (typeof window === 'undefined') return

    if (Object.keys(params).length === 0) return

    const stored = {
      ...params,
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stored))
      
      // Also store session data
      sessionStorage.setItem(this.sessionKey, JSON.stringify(stored))
    } catch (error) {
      console.error('UTMfy: Error storing params', error)
    }
  }

  // Get stored UTM parameters
  getStored(): UTMParams | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return null

      const data = JSON.parse(stored)
      const expiryTime = this.expiryDays * 24 * 60 * 60 * 1000

      // Check if expired
      if (Date.now() - data.timestamp > expiryTime) {
        this.clear()
        return null
      }

      const { timestamp, ...params } = data
      return params
    } catch (error) {
      console.error('UTMfy: Error reading stored params', error)
      return null
    }
  }

  // Get session UTM parameters
  getSession(): UTMParams | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = sessionStorage.getItem(this.sessionKey)
      if (!stored) return null

      const data = JSON.parse(stored)
      const { timestamp, ...params } = data
      return params
    } catch (error) {
      console.error('UTMfy: Error reading session params', error)
      return null
    }
  }

  // Clear stored parameters
  clear(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.storageKey)
      sessionStorage.removeItem(this.sessionKey)
    } catch (error) {
      console.error('UTMfy: Error clearing params', error)
    }
  }

  // Get all UTM data (URL params take priority over stored)
  getAll(): UTMParams {
    const urlParams = this.getParamsFromURL()
    const storedParams = this.getStored()

    // URL params take priority
    return {
      ...storedParams,
      ...urlParams,
    }
  }

  // Track page view with UTM data
  trackPageView(data?: Record<string, any>): void {
    if (typeof window === 'undefined') return

    const utmData = this.getAll()

    // Push to dataLayer for GTM
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        ...utmData,
        ...data,
      })
    }

    // Push to Facebook Pixel if available
    if ((window as any).fbq) {
      (window as any).fbq('track', 'PageView', {
        ...utmData,
        ...data,
      })
    }

    console.log('UTMfy: Page view tracked', { ...utmData, ...data })
  }

  // Track custom event
  trackEvent(eventName: string, data?: Record<string, any>): void {
    if (typeof window === 'undefined') return

    const utmData = this.getAll()

    // Push to dataLayer for GTM
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...utmData,
        ...data,
      })
    }

    // Push to Facebook Pixel if available
    if ((window as any).fbq) {
      (window as any).fbq('trackCustom', eventName, {
        ...utmData,
        ...data,
      })
    }

    console.log('UTMfy: Event tracked', eventName, { ...utmData, ...data })
  }
}

// Export singleton instance
export const utmfy = new UTMfy()

