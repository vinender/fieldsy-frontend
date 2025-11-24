import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    quality?: number;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Optimized image component using Next.js Image with loading states
 * Automatically converts to WebP/AVIF and provides lazy loading
 * 
 * @example
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={400}
 *   height={300}
 *   priority={false}
 * />
 */
export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    fill = false,
    sizes,
    quality = 75,
    objectFit = 'cover',
    onLoad,
    onError,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        setIsLoading(false);
        onError?.();
    };

    if (error) {
        return (
            <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
                <span className="text-gray-400 text-sm">Image unavailable</span>
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                fill={fill}
                sizes={sizes || (fill ? '100vw' : undefined)}
                quality={quality}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100',
                    objectFit === 'cover' && 'object-cover',
                    objectFit === 'contain' && 'object-contain',
                    objectFit === 'fill' && 'object-fill',
                    objectFit === 'none' && 'object-none',
                    objectFit === 'scale-down' && 'object-scale-down'
                )}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
}
