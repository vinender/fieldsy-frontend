/**
 * Get the appropriate image URL for a user
 * Priority:
 * 1. User's image property
 * 2. Google image if provider is Google
 * 3. Profile image (legacy field)
 * 4. Return null for fallback rendering
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

  // Priority 4: Return null to trigger fallback gradient/initial rendering
  return null;
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

  // If full name with space, get first letters of first and last name
  if (name.includes(' ')) {
    const parts = name.split(' ');
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  // Otherwise just first letter
  return name.charAt(0).toUpperCase();
};