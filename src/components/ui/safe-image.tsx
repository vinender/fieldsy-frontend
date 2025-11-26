import Image, { ImageProps } from 'next/image'
import { useState, useEffect } from 'react'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
  onError?: () => void
}

/**
 * SafeImage component that handles image loading errors gracefully
 * Prevents page reloads and provides fallback images when loading fails
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = '/placeholder-field.svg',
  onError,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Reset error state when src changes
  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
      onError?.()
    }
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      unoptimized={hasError}
    />
  )
}

interface SafeImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  onErrorCallback?: () => void
}

/**
 * SafeImg component for regular img tags (non-Next.js Image)
 * Handles image loading errors gracefully
 */
export function SafeImg({
  src,
  alt,
  fallbackSrc = '/placeholder-field.svg',
  onErrorCallback,
  ...props
}: SafeImgProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Reset error state when src changes
  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
      onErrorCallback?.()
    }
  }

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  )
}
