# Dockerfile otimizado para Coolify
# Debian Bullseye (11) tem libssl.so.1.1; Alpine/Bookworm usam OpenSSL 3 e quebram o engine do Prisma
FROM node:20-bullseye-slim AS base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install all dependencies including devDependencies for build
RUN npm ci --include=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files including components
COPY . .
# Ensure components directory exists
RUN ls -la components/ || echo "Components directory check"

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
# Don't set NODE_ENV=production during build to allow devDependencies
# ENV NODE_ENV=production

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates libssl1.1 && rm -rf /var/lib/apt/lists/*

# Copy necessary files for standalone build
# Note: standalone output includes server.js, node_modules, and .next in its root
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Verify server.js exists
RUN ls -la server.js || (echo "ERROR: server.js not found!" && exit 1)

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone creates server.js in the root of standalone directory
CMD ["node", "server.js"]

