/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Otimizado para Docker/Coolify
  // Uploads grandes via FormData / Server Actions (proxy pode ter limite próprio — ex.: nginx client_max_body_size)
  experimental: {
    serverActions: {
      bodySizeLimit: '40mb',
    },
  },
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'production' && process.env.USE_STATIC_EXPORT === 'true',
  },
  // Para deploy estático (se necessário)
  ...(process.env.USE_STATIC_EXPORT === 'true' && {
    output: 'export',
    trailingSlash: true,
  }),
}

module.exports = nextConfig

