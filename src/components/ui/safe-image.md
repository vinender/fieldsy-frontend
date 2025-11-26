# SafeImage Component

A wrapper around Next.js Image component that handles image loading errors gracefully without causing page reloads.

## Features

- ✅ Prevents page reloads when images fail to load
- ✅ Automatic fallback to placeholder images
- ✅ No infinite loop errors
- ✅ Suppresses console error messages
- ✅ TypeScript support
- ✅ Drop-in replacement for Next.js Image component

## Usage

### Basic Usage

```tsx
import { SafeImage } from '@/components/ui/safe-image'

<SafeImage
  src="/some-image.jpg"
  alt="Description"
  width={300}
  height={200}
/>
```

### With Custom Fallback

```tsx
<SafeImage
  src="/user-avatar.jpg"
  alt="User Avatar"
  width={100}
  height={100}
  fallbackSrc="/default-avatar.png"
/>
```

### With Error Callback

```tsx
<SafeImage
  src="/profile-pic.jpg"
  alt="Profile"
  width={150}
  height={150}
  onError={() => console.log('Image failed to load')}
/>
```

### For Regular img Tags

```tsx
import { SafeImg } from '@/components/ui/safe-image'

<SafeImg
  src="/image.jpg"
  alt="Description"
  className="w-full h-full object-cover"
  fallbackSrc="/placeholder.jpg"
/>
```

## API

### SafeImage Props

All Next.js Image props are supported, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fallbackSrc` | `string` | `'/placeholder-field.jpg'` | Image to show when loading fails |
| `onError` | `() => void` | `undefined` | Callback when image fails to load |

### SafeImg Props

All regular img tag props are supported, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fallbackSrc` | `string` | `'/placeholder-field.jpg'` | Image to show when loading fails |
| `onErrorCallback` | `() => void` | `undefined` | Callback when image fails to load |

## How It Works

1. Component tracks the current image source in state
2. When an error occurs, it checks if an error was already handled (prevents loops)
3. Switches to the fallback image
4. For Next.js Image, sets `unoptimized={true}` for fallback to avoid re-processing
5. Error suppression is handled globally via `suppress-dev-errors.ts`

## Migration Guide

### Before (Next.js Image)
```tsx
<Image
  src={imageUrl}
  alt="Field"
  width={300}
  height={200}
/>
```

### After (SafeImage)
```tsx
<SafeImage
  src={imageUrl}
  alt="Field"
  width={300}
  height={200}
  fallbackSrc="/placeholder-field.jpg"
/>
```

### Before (Regular img)
```tsx
<img
  src={imageUrl}
  alt="Field"
  className="w-full h-full"
/>
```

### After (SafeImg)
```tsx
<SafeImg
  src={imageUrl}
  alt="Field"
  className="w-full h-full"
  fallbackSrc="/placeholder-field.jpg"
/>
```

## Notes

- Error messages are automatically suppressed in development (see `lib/utils/suppress-dev-errors.ts`)
- The component resets error state when `src` prop changes
- Fallback images should be small and always available locally
- The component prevents infinite error loops by tracking error state
