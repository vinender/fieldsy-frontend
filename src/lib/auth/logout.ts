import { signOut } from 'next-auth/react';
import { clearAxiosAuthToken } from '@/lib/api/axios-client';

/**
 * Single source of truth for logout.
 * Clears ALL client-side state and signs out via NextAuth.
 */
export async function performLogout(queryClient?: any) {
  // 1. Clear axios token cache immediately (prevents stale token on next request)
  clearAxiosAuthToken();

  // 2. Clear React Query cache if available
  if (queryClient) {
    queryClient.clear();
  }

  // 2. Clear ALL browser storage
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();

    // 3. Clear ALL cookies
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax`;
    });

    // 4. Clear browser Cache API
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      } catch (e) {
        // Ignore cache clearing errors
      }
    }
  }

  // 5. Sign out via NextAuth
  await signOut({ callbackUrl: '/', redirect: true });
}
