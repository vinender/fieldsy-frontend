# Multi-stage build for Fieldsy Frontend (Next.js)
# =================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy config files first (change rarely - better layer caching)
COPY package.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts ./
COPY .env.production* ./

# Copy source and public separately (change more often)
COPY src ./src
COPY public ./public

# Set NODE_ENV to production so Next.js reads .env.production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Skip font optimization during build to avoid network timeouts
ENV NEXT_FONT_GOOGLE_SKIP_VALIDATE=1

# Build the application (Next.js will read .env.production automatically)
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets with correct ownership (avoids extra chown layer that doubles image size)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Expose port (Frontend runs on 3000)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
