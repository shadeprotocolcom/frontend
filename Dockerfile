FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app

COPY package.json ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# --- Build ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_CONTRACT_ADDRESS
ARG NEXT_PUBLIC_WCBTC_ADDRESS
ARG NEXT_PUBLIC_INDEXER_URL
ARG NEXT_PUBLIC_PROVER_URL
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

ENV NEXT_PUBLIC_CONTRACT_ADDRESS=$NEXT_PUBLIC_CONTRACT_ADDRESS
ENV NEXT_PUBLIC_WCBTC_ADDRESS=$NEXT_PUBLIC_WCBTC_ADDRESS
ENV NEXT_PUBLIC_INDEXER_URL=$NEXT_PUBLIC_INDEXER_URL
ENV NEXT_PUBLIC_PROVER_URL=$NEXT_PUBLIC_PROVER_URL
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Leverage Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
