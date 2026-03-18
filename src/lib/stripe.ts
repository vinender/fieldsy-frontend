import { loadStripe } from '@stripe/stripe-js';

// Priority order for keys:
// 1. Explicitly set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (most reliable)
// 2. Calculated key based on PRODUCTION_MODE toggle
const isProduction = process.env.NEXT_PUBLIC_STRIPE_PRODUCTION_MODE === 'true';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  (isProduction
    ? process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY);

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('Stripe Publishable Key is missing! Check your environment variables.');
}

// Log mode for debugging (only in development or if explicitly enabled)
if (typeof window !== 'undefined') {
  const mode = STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live') ? 'LIVE' : 'TEST';
  console.log(`[Stripe] Initialized in ${mode} mode`);
}

// Eagerly start loading Stripe.js
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY || '');