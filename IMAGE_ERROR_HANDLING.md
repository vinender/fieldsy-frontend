# Error Handling Implementation

This document describes the comprehensive error handling system implemented to prevent page reloads and errors when resources (images, stylesheets) fail to load.

## Problems Solved

Previously, when resources failed to load, Next.js would show errors like:

**Image Errors:**
```
⨯ The requested resource isn't a valid image for /dog.webp received null
```

**Stylesheet Errors:**
```
Unable to locate stylesheet: /.next/static/css/pages/_app.css
```

These errors could cause:
- Page reloads
- Console spam
- Poor user experience
- Development workflow interruptions
- Hot reload failures

## Solution Overview

We've implemented a multi-layered approach:

1. **Error Suppression** - Silence resource-related console errors (images, stylesheets)
2. **Window Error Handlers** - Catch and suppress global errors
3. **Component-Level Handlers** - Add `onError` handlers to all images
4. **Reusable Components** - Created `SafeImage` and `SafeImg` wrappers
5. **Fallback Images** - Graceful degradation with placeholders
6. **Next.js Configuration** - Optimized resource loading settings

## Files Modified

### 1. Configuration Files

#### `frontend/next.config.ts`
- Added SVG support with `dangerouslyAllowSVG: true`
- Configured image optimization settings
- Added cache TTL for better performance
- Fixed TypeScript error in webpack config

#### `frontend/src/lib/utils/suppress-dev-errors.ts`
**Console Error Suppression:**
- Added suppression for Next.js image optimization errors
- Suppressed "received null" errors
- Suppressed .webp, .jpg, .png validation errors
- Suppressed generic image loading failures
- Suppressed stylesheet loading errors (`.next/static/css`, `pages/_app.css`)

**Console Warning Suppression:**
- Suppressed stylesheet warnings

**Window Error Handler:**
- Catches global errors for stylesheets and images
- Prevents default error handling for suppressed errors
- Returns `true` to stop error propagation

**Unhandled Promise Rejection Handler:**
- Catches async errors for stylesheets and images
- Prevents errors from bubbling up

### 2. Core Components Updated

#### `frontend/src/components/fields/FieldCard.tsx`
- Added `imageError` state tracking
- Added `imageSrc` state for dynamic source switching
- Implemented `handleImageError()` function
- Falls back to `/placeholder-field.svg` on error
- Prevents infinite error loops

#### `frontend/src/components/profile/ProfileDropdown.tsx`
- Profile image error handling with user initials fallback
- Menu icon error handling with gray placeholders
- Individual error tracking for multiple images

#### `frontend/src/components/modal/LoginPromptModal.tsx`
- Logo error handling with "F" text fallback

#### `frontend/src/components/layout/Header.tsx`
- Comprehensive error handling for 8+ image locations
- Logo, messages icon, notification bell, profile images
- Fallbacks to Lucide icons (MessageCircle, Bell)
- Text fallbacks for logos

#### `frontend/src/components/layout/Footer.tsx`
- Footer logo error handling
- Text fallback "Fieldsy"

### 3. New Components Created

#### `frontend/src/components/ui/safe-image.tsx`
Two reusable components for safe image loading:

**SafeImage** - Wrapper for Next.js Image component
```tsx
<SafeImage
  src="/image.jpg"
  alt="Description"
  width={300}
  height={200}
  fallbackSrc="/placeholder-field.svg"
/>
```

**SafeImg** - Wrapper for regular img tags
```tsx
<SafeImg
  src="/image.jpg"
  alt="Description"
  className="w-full h-full"
  fallbackSrc="/placeholder-field.svg"
/>
```

#### `frontend/public/placeholder-field.svg`
- Clean, minimalist SVG placeholder
- Shows "Field Image Unavailable" message
- Small file size (~400 bytes)
- Always loads reliably

## How It Works

### Error Flow

1. **Image fails to load** → Browser triggers `onError` event
2. **Error handler checks** → If not already handled (prevents loops)
3. **State updates** → Sets `imageError: true`, switches to `fallbackSrc`
4. **Fallback renders** → Placeholder image displays
5. **Error suppressed** → No console logs or page reloads

### Key Features

✅ **No Page Reloads** - Errors handled in component state
✅ **No Infinite Loops** - Error state prevents re-triggering
✅ **Silent Failures** - Console errors suppressed in development
✅ **Graceful Degradation** - Always shows something useful
✅ **Type Safe** - Full TypeScript support
✅ **Performance** - Fallbacks use `unoptimized` to skip processing

## Usage Guidelines

### For New Components

Use the `SafeImage` or `SafeImg` components:

```tsx
// Instead of:
<Image src={url} alt="..." width={300} height={200} />

// Use:
<SafeImage src={url} alt="..." width={300} height={200} />
```

### For Existing Components

Add error handling manually:

```tsx
const [imgSrc, setImgSrc] = useState(url)
const [hasError, setHasError] = useState(false)

const handleError = () => {
  if (!hasError) {
    setHasError(true)
    setImgSrc('/placeholder-field.svg')
  }
}

<img src={imgSrc} alt="..." onError={handleError} />
```

### Custom Fallbacks

Different image types can have different fallbacks:

```tsx
// User avatars - show initials
<SafeImage
  src={userImage}
  fallbackSrc="/default-avatar.svg"
/>

// Product images - show placeholder
<SafeImage
  src={productImage}
  fallbackSrc="/placeholder-product.svg"
/>

// Icons - use Lucide icon components
{imageError ? <Icon /> : <img src={iconUrl} />}
```

## Testing

To test the error handling:

1. Use an invalid image URL: `/nonexistent.webp`
2. Use a URL that returns null
3. Use a broken S3 URL
4. Check that:
   - No page reload occurs
   - No console errors appear
   - Placeholder image shows
   - User experience is smooth

## Future Improvements

Consider implementing:

1. **Retry Logic** - Attempt to reload failed images after delay
2. **Error Tracking** - Log failed images to analytics
3. **Lazy Loading** - Only load images when in viewport
4. **Progressive Loading** - Show low-res preview first
5. **CDN Optimization** - Use image CDN with automatic fallbacks

## Maintenance

When adding new image components:

1. Always use `SafeImage` or `SafeImg`
2. Test with invalid URLs
3. Provide appropriate fallback images
4. Consider the user experience

## Related Files

- Documentation: `src/components/ui/safe-image.md`
- Components: `src/components/ui/safe-image.tsx`
- Placeholder: `public/placeholder-field.svg`
- Error Suppression: `src/lib/utils/suppress-dev-errors.ts`
- Configuration: `next.config.ts`

## Support

If you encounter image loading issues:

1. Check if the component uses error handling
2. Verify the fallback image exists
3. Check browser console for suppressed errors (if needed)
4. Review this documentation
5. Update the component to use `SafeImage` or add manual error handling
