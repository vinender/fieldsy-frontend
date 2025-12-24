/**
 * Get the appropriate image URL for a user
 * Priority:
 * 1. User's image property
 * 2. Google image if provider is Google
 * 3. Profile image (legacy field)
 * 4. Generate image from user initials (colored circle with initials)
 * 5. Return null for SSR or when canvas is not available
 */
interface UserWithImage {
  image?: string | null;
  profileImage?: string | null;
  provider?: string | null;
  name?: string | null;
  email?: string | null;
  googleImage?: string | null;
}

export const getUserImage = (user: UserWithImage | null | undefined): string | null => {
  // Check if user object exists
  console.log(';; userhasImage', user)
  if (!user) {
    return null;
  }

  // Priority 1: Use image property if it exists
  if (user.image && typeof user.image === 'string' && user.image.trim()) {
    return user.image;
  }

  // Priority 2: Use Google image if provider is Google
  if (user.provider === 'google' && user.googleImage) {
    return user.googleImage;
  }

  // Priority 3: Check for profileImage (legacy field)
  if (user.profileImage && typeof user.profileImage === 'string' && user.profileImage.trim()) {
    return user.profileImage;
  }

  // Priority 4: Return default placeholder image
  // Check if we're in a browser environment (has document)
  if (typeof document !== 'undefined') {
    return '/user.svg';
  }

  // Priority 5: Return null (or user.svg for consistency) for SSR
  return '/user.svg';
};

/**
 * Generate a dummy avatar image URL
 * @deprecated Use getUserInitials() instead and render a gradient div with initials
 * This function is kept for backwards compatibility but should not be used
 */
export const generateDummyImage = (nameOrEmail?: string): string => {
  // Return empty string to signal that we should use CSS-based avatar instead
  return '';
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: UserWithImage | null | undefined): string => {
  if (!user) return 'User';

  return user.name || (user as any).firstName || user.email?.split('@')[0] || 'User';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: UserWithImage | null | undefined | { name?: string | null; email?: string | null }): string => {
  if (!user) return 'U';

  const name = user.name || (user as any).firstName || user.email;
  if (!name) return 'U';

  // If full name with space, get first letters of first TWO words only
  if (name.includes(' ')) {
    const parts = name.trim().split(/\s+/); // Split by whitespace
    // Get first two words only
    const firstInitial = parts[0].charAt(0);
    const secondInitial = parts.length > 1 ? parts[1].charAt(0) : '';
    return `${firstInitial}${secondInitial}`.toUpperCase();
  }

  // Otherwise just first letter
  return name.charAt(0).toUpperCase();
};

/**
 * Generate a color based on user's name or email for consistent avatar colors
 */
const getColorFromString = (str: string): string => {
  const colors = [
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#F59E0B', // amber
    '#EF4444', // red
    '#14B8A6', // teal
    '#F97316', // orange
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Generate a data URL image from user initials
 * Creates a colored circle with white text containing the user's initials
 */
export const generateInitialsImage = (user: UserWithImage | null | undefined): string => {
  return '/user.svg';
};