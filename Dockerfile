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
COPY . .

# Ensure .env.production exists and show its contents for debugging
RUN echo "=== .env.production contents ===" && cat .env.production && echo "=== end ==="

# Set NODE_ENV to production so Next.js reads .env.production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

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

# Copy built assets - order matters for Next.js standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Debug: List static files to verify they were copied
RUN ls -la ./.next/static/css/ 2>/dev/null || echo "CSS dir check"
RUN ls -la ./public/ | head -20

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port (Frontend runs on 3000)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
