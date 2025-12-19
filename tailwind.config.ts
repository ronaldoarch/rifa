import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#FFD700',
          dark: '#1a1a1a',
          green: '#2d5016',
        },
      },
    },
  },
  plugins: [],
}
export default config

