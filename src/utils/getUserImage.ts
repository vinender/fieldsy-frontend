/**
 * Get the appropriate image URL for a user
 * Priority: 
 * 1. User's image property
 * 2. Google image if provider is Google  
 * 3. Profile image (legacy field)
 * 4. Dummy/placeholder image
 */
export const getUserImage = (user: any): string => {
  // Check if user object exists
  if (!user) {
    return generateDummyImage();
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

  // Priority 4: Return dummy image with user initial
  return generateDummyImage(user.name || user.email);
};

/**
 * Generate a dummy avatar image URL
 * Uses UI Avatars service or fallback
 */
export const generateDummyImage = (nameOrEmail?: string): string => {
  if (nameOrEmail) {
    // Get first letter of name or email
    const initial = nameOrEmail.charAt(0).toUpperCase();
    // Use UI Avatars service for generating avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=3A6B22&color=fff&size=200`;
  }
  
  // Default placeholder if no name/email provided
  return 'https://ui-avatars.com/api/?name=U&background=3A6B22&color=fff&size=200';
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: any): string => {
  if (!user) return 'User';
  
  return user.name || user.firstName || user.email?.split('@')[0] || 'User';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: any): string => {
  if (!user) return 'U';
  
  const name = user.name || user.firstName || user.email;
  if (!name) return 'U';
  
  // If full name with space, get first letters of first and last name
  if (name.includes(' ')) {
    const parts = name.split(' ');
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  
  // Otherwise just first letter
  return name.charAt(0).toUpperCase();
};