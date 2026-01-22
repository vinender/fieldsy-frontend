/**
 * Utility function to fix malformed socket URLs
 * Handles various edge cases like:
 * - Double protocols (https://https://)
 * - Truncated URLs (https, https/, https://https)
 * - Invalid protocols
 */
export function fixMalformedSocketUrl(url: string | undefined, context: string = '[Socket]'): string {
  // Default fallbacks
  const LOCALHOST_URL = 'http://localhost:5000';
  const PRODUCTION_URL = 'https://api.fieldsy.co.uk';

  // If no URL provided, use localhost
  if (!url || typeof url !== 'string') {
    console.warn(`${context} No socket URL provided, using localhost`);
    return LOCALHOST_URL;
  }

  let fixedUrl = url.trim();

  // Fix double protocol issues (e.g., https://https://, http://http://)
  if (fixedUrl.match(/^https?:\/\/https?:\/\//)) {
    fixedUrl = fixedUrl.replace(/^(https?):\/\/https?:\/\//, '$1://');
    console.log(`${context} Fixed double protocol: ${url} -> ${fixedUrl}`);
  }

  // Fix truncated/malformed URLs that are just the protocol
  // Matches: https, https/, https://, https://https, https://https/, http, http/, etc.
  if (fixedUrl.match(/^https?:?\/?\/?(?:https?)?\/?\/?$/i)) {
    console.warn(`${context} Malformed/truncated URL detected: "${url}", falling back to production URL`);
    return PRODUCTION_URL;
  }

  // Check if URL is missing domain after protocol
  // e.g., "https://" with nothing after
  const urlParts = fixedUrl.match(/^(https?:\/\/)(.*)$/);
  if (urlParts) {
    const domain = urlParts[2];
    // If domain is empty, just slashes, or malformed
    if (!domain || domain.match(/^\/+$/) || domain.length < 3) {
      console.warn(`${context} URL has invalid domain: "${url}", falling back to production URL`);
      return PRODUCTION_URL;
    }
  }

  // Final validation: must start with http:// or https://
  if (!fixedUrl.match(/^https?:\/\//)) {
    console.warn(`${context} Invalid socket URL protocol: "${url}", falling back to localhost`);
    return LOCALHOST_URL;
  }

  // Remove trailing /api if present (socket connects to base URL, not API endpoint)
  if (fixedUrl.endsWith('/api')) {
    fixedUrl = fixedUrl.replace(/\/api$/, '');
    console.log(`${context} Removed trailing /api: ${url} -> ${fixedUrl}`);
  }

  return fixedUrl;
}

/**
 * Get the socket URL with production detection
 */
export function getSocketUrl(context: string = '[Socket]'): string {
  let socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  // Force production URL if running on fieldsy.co.uk domain
  if (typeof window !== 'undefined' && window.location.hostname.includes('fieldsy.co.uk')) {
    socketUrl = 'https://api.fieldsy.co.uk';
    console.log(`${context} Detected production domain, using: ${socketUrl}`);
  }

  console.log(`${context} Raw NEXT_PUBLIC_BACKEND_URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);

  // Fix any malformed URL issues
  return fixMalformedSocketUrl(socketUrl, context);
}
