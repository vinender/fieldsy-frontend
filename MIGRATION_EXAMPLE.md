# Image Error Handling - Migration Examples

## Quick Reference

### Next.js Image Component

**Before:**
```tsx
import Image from 'next/image'

<Image
  src="/dog.webp"
  alt="Dog"
  width={300}
  height={200}
/>
```

**After:**
```tsx
import { SafeImage } from '@/components/ui/safe-image'

<SafeImage
  src="/dog.webp"
  alt="Dog"
  width={300}
  height={200}
  fallbackSrc="/placeholder-field.svg"
/>
```

### Regular img Tag

**Before:**
```tsx
<img
  src="/dog.webp"
  alt="Dog"
  className="w-full h-full object-cover"
/>
```

**After:**
```tsx
import { SafeImg } from '@/components/ui/safe-image'

<SafeImg
  src="/dog.webp"
  alt="Dog"
  className="w-full h-full object-cover"
  fallbackSrc="/placeholder-field.svg"
/>
```

## Manual Error Handling (Alternative)

If you prefer not to use the wrapper components:

### For Next.js Image

```tsx
import Image from 'next/image'
import { useState, useEffect } from 'react'

function MyComponent({ imageUrl }: { imageUrl: string }) {
  const [imgSrc, setImgSrc] = useState(imageUrl)
  const [hasError, setHasError] = useState(false)

  // Reset error when imageUrl changes
  useEffect(() => {
    setImgSrc(imageUrl)
    setHasError(false)
  }, [imageUrl])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/placeholder-field.svg')
    }
  }

  return (
    <Image
      src={imgSrc}
      alt="Description"
      width={300}
      height={200}
      onError={handleError}
      unoptimized={hasError}
    />
  )
}
```

### For Regular img Tag

```tsx
import { useState, useEffect } from 'react'

function MyComponent({ imageUrl }: { imageUrl: string }) {
  const [imgSrc, setImgSrc] = useState(imageUrl)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(imageUrl)
    setHasError(false)
  }, [imageUrl])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/placeholder-field.svg')
    }
  }

  return (
    <img
      src={imgSrc}
      alt="Description"
      className="w-full h-full object-cover"
      onError={handleError}
    />
  )
}
```

## Real-World Examples

### Example 1: Field Card

**Before:**
```tsx
<div className="relative h-[200px]">
  <Image
    src={getImageUrl(field.image)}
    alt={field.name}
    fill
    className="object-cover"
  />
</div>
```

**After:**
```tsx
<div className="relative h-[200px]">
  <SafeImage
    src={getImageUrl(field.image)}
    alt={field.name}
    fill
    className="object-cover"
    fallbackSrc="/placeholder-field.svg"
  />
</div>
```

### Example 2: User Avatar

**Before:**
```tsx
<img
  src={user.profileImage}
  alt={user.name}
  className="w-10 h-10 rounded-full"
/>
```

**After:**
```tsx
<SafeImg
  src={user.profileImage}
  alt={user.name}
  className="w-10 h-10 rounded-full"
  fallbackSrc="/default-avatar.svg"
/>
```

### Example 3: Logo

**Before:**
```tsx
<img
  src="/logo.svg"
  alt="Fieldsy"
  className="h-8"
/>
```

**After:**
```tsx
<SafeImg
  src="/logo.svg"
  alt="Fieldsy"
  className="h-8"
  fallbackSrc="/logo-fallback.svg"
/>
```

## Custom Fallback Logic

For more complex scenarios where you want custom fallback behavior:

```tsx
import { SafeImage } from '@/components/ui/safe-image'
import { useState } from 'react'

function ProfileImage({ user }: { user: User }) {
  const [showFallback, setShowFallback] = useState(false)

  if (showFallback || !user.profileImage) {
    // Show user initials as fallback
    return (
      <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
        {user.name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <SafeImage
      src={user.profileImage}
      alt={user.name}
      width={40}
      height={40}
      className="rounded-full"
      onError={() => setShowFallback(true)}
    />
  )
}
```

## Icon Fallbacks

For icon images that should fall back to Lucide icons:

```tsx
import { MessageCircle } from 'lucide-react'
import { SafeImg } from '@/components/ui/safe-image'
import { useState } from 'react'

function MessageIcon() {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <MessageCircle className="w-5 h-5 text-gray-600" />
  }

  return (
    <SafeImg
      src="/icons/message.svg"
      alt="Messages"
      className="w-5 h-5"
      onErrorCallback={() => setHasError(true)}
    />
  )
}
```

## Error Callback Usage

When you need to track or respond to image errors:

```tsx
<SafeImage
  src="/might-fail.jpg"
  alt="Example"
  width={300}
  height={200}
  onError={() => {
    // Log to analytics
    console.log('Image failed to load')
    // Update state
    // Show notification
  }}
/>
```

## Best Practices

1. **Always provide alt text** - Important for accessibility
2. **Use appropriate fallbacks** - Match the context of the image
3. **Test with invalid URLs** - Ensure fallbacks work as expected
4. **Keep fallbacks small** - Use SVG or optimized images
5. **Consider lazy loading** - For images below the fold
6. **Use consistent placeholders** - Create a unified look

## Troubleshooting

### Problem: Fallback image also fails to load
**Solution:** Use an SVG data URI or inline SVG as ultimate fallback

### Problem: Infinite loop of errors
**Solution:** Check that you're using the `hasError` state guard

### Problem: Page still reloads
**Solution:** Ensure error suppression is active in `suppress-dev-errors.ts`

### Problem: Still seeing console errors
**Solution:** Check that the error patterns match in the suppression file

## Performance Considerations

- Fallback images should be small (< 10KB)
- Use SVG when possible for infinite scaling
- Consider using data URIs for very small images
- Don't use `unoptimized` unless necessary (it's auto-set on error)
- Cache fallback images aggressively

## Accessibility

Always provide meaningful alt text:

```tsx
// Good
<SafeImage src={url} alt="Happy dog playing in field" />

// Bad
<SafeImage src={url} alt="Image" />

// For decorative images
<SafeImage src={url} alt="" role="presentation" />
```
