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

# ============================================================
# PRODUCTION OVERRIDES — passed via --build-arg from build_and_deploy.sh
# These override any values in .env.production at build time
# Defaults here are the production values (fallback if no --build-arg passed)
# ============================================================
ARG NEXT_PUBLIC_API_URL=https://api.fieldsy.co.uk/api
ARG NEXT_PUBLIC_BACKEND_URL=https://api.fieldsy.co.uk
ARG NEXTAUTH_URL=https://fieldsy.co.uk
ARG NEXT_PUBLIC_STRIPE_PRODUCTION_MODE=false
ARG NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_S3_BASE_URL=https://fieldsy-s3.s3.eu-west-2.amazonaws.com
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_STRIPE_PRODUCTION_MODE=$NEXT_PUBLIC_STRIPE_PRODUCTION_MODE
ENV NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_S3_BASE_URL=$NEXT_PUBLIC_S3_BASE_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_VAPID_KEY=$NEXT_PUBLIC_FIREBASE_VAPID_KEY

# Build the application
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
