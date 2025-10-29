import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-field.jpg',
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px', // Start loading images 50px before they enter viewport
  });

  useEffect(() => {
    if (inView && !imageLoaded && !hasError) {
      // Create a new image to preload
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setImageLoaded(true);
      };

      img.onerror = () => {
        setHasError(true);
        setImageSrc(placeholder); // Fallback to placeholder on error
      };

      img.src = src;
    }
  }, [inView, src, imageLoaded, hasError, placeholder]);

  return (
    <div ref={ref} className="relative w-full h-full">
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-50'
        }`}
        loading="lazy"
      />

      {!imageLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
