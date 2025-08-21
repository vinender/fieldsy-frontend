import { loadStripe } from '@stripe/stripe-js';

// Use a test publishable key for development
// Replace with your actual publishable key from Stripe Dashboard
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51NJCCIA0G2sMzLyx1jYGEhhNmxUxOGA2WLkDTketegQ47wtcdzVLIsNIPqDqDk5OMMDML8TZqOgvY5eVDS2grW2A00qC9GRf71';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);