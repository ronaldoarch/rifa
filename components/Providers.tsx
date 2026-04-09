'use client'

import { Toaster } from 'sonner'
import SsoHandler from './SsoHandler'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SsoHandler />
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'inherit' },
        }}
      />
    </>
  )
}
