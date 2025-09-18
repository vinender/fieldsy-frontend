/**
 * Utility function to get the proper image URL
 * Handles both full URLs and relative paths
 */
export function getImageUrl(url: string | null | undefined): string {
  // Return default placeholder if no URL provided
  if (!url) {
    return '/placeholder-image.png';
  }

  // If it's already a full URL (starts with http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it starts with a slash, it's a local asset
  if (url.startsWith('/')) {
    return url;
  }

  // Otherwise, prepend the S3 base URL
  const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || 'https://fieldsy.s3.us-east-1.amazonaws.com';
  
  // Ensure no double slashes
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  
  return `${s3BaseUrl}/${cleanPath}`;
}

/**
 * Get user avatar with fallback
 */
export function getUserAvatar(imageUrl?: string | null, name?: string | null): string {
  if (imageUrl) {
    return getImageUrl(imageUrl);
  }
  
  // Return initials-based placeholder or default avatar
  return '/profile/default-avatar.png';
}

/**
 * Get field image with fallback
 */
export function getFieldImage(imageUrl?: string | null, index: number = 0): string {
  if (imageUrl) {
    return getImageUrl(imageUrl);
  }
  
  // Return default field placeholder
  return '/fields/placeholder.png';
}

/**
 * Process an array of image URLs
 */
export function getImageUrls(urls: (string | null | undefined)[]): string[] {
  return urls
    .filter(url => url !== null && url !== undefined)
    .map(url => getImageUrl(url as string));
}

/**
 * Check if URL is an S3 URL
 */
export function isS3Url(url: string): boolean {
  const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || 'https://fieldsy.s3.us-east-1.amazonaws.com';
  return url.includes('s3.amazonaws.com') || url.includes(s3BaseUrl);
}

/**
 * Extract file name from URL
 */
export function getFileNameFromUrl(url: string): string {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] || 'unknown';
}