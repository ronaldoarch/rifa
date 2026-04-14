# Dockerfile otimizado para Coolify
# Debian Bullseye (11) tem libssl.so.1.1; Alpine/Bookworm usam OpenSSL 3 e quebram o engine do Prisma
#
# Observação (Coolify): builds podem falhar em `apt-get update` por instabilidade de rede/timeout.
# Para reduzir dependência de rede durante o build, usamos a imagem Debian completa (não slim)
# e evitamos `apt-get` nas etapas de build/runtime.
FROM node:20-bullseye AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install all dependencies including devDependencies for build
RUN npm ci --include=dev

# Rebuild the source code only when needed
FROM base AS builder
# Coolify/servidores com pouca RAM: aumente no build (ex.: --build-arg NODE_MEMORY_LIMIT=8192)
ARG NODE_MEMORY_LIMIT=8192
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files including components
COPY . .
# Ensure components directory exists
RUN ls -la components/ || echo "Components directory check"

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
# Next.js 15 em Docker costuma falhar em "Linting" / "Collecting build traces" com OOM em hosts com pouca RAM.
ENV NODE_OPTIONS="--max-old-space-size=${NODE_MEMORY_LIMIT}"
# Don't set NODE_ENV=production during build to allow devDependencies
# ENV NODE_ENV=production

# Prisma + Next (sem `npm run build` para evitar prisma generate duplicado).
# --no-lint reduz RAM/tempo no builder; rode `npm run lint` no CI ou localmente antes do deploy.
RUN npx prisma generate && npx next build --no-lint

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Copy necessary files for standalone build
# Note: standalone output includes server.js, node_modules, and .next in its root
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma CLI + engines para rodar db push na subida (cria/atualiza tabelas no banco de produção)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Verify server.js exists
RUN ls -la server.js || (echo "ERROR: server.js not found!" && exit 1)

# Uploads (logo, banners, etc.): diretório gravável. Em Coolify, mapeie volume persistente em
# /app/public/uploads para não perder ficheiros a cada redeploy (senão o browser recebe 404).
RUN mkdir -p /app/public/uploads/logo /app/public/uploads/banner /app/public/uploads/raffle /app/public/uploads/showcase

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Na subida: aplica o schema no banco (DATABASE_URL) e inicia o servidor
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js db push && exec node server.js"]

