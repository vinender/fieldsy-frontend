import { loadStripe } from '@stripe/stripe-js';

const isProduction = process.env.NEXT_PUBLIC_STRIPE_PRODUCTION_MODE === 'true';

const STRIPE_PUBLISHABLE_KEY = isProduction
  ? process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY!
  : process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY!;

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);