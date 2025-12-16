import React, { useEffect, useState } from 'react';

interface SvgIconProps {
  src: string;
  className?: string;
  color?: string;
  size?: number | string;
  alt?: string;
  fallback?: React.ReactNode;
}

// Global cache for SVG content to avoid re-fetching
const svgCache = new Map<string, string>();
const errorCache = new Set<string>();

/**
 * SvgIcon component that fetches SVG files and renders them inline
 * This allows for proper fill/stroke color manipulation via CSS
 *
 * @param src - Path to the SVG file
 * @param className - Additional CSS classes (use fill-* and stroke-* for colors)
 * @param color - Direct color value (hex, rgb, etc.) - applies to both fill and stroke
 * @param size - Width and height in pixels or as string with units
 * @param alt - Alt text for accessibility
 * @param fallback - Fallback content if SVG fails to load
 */
export const SvgIcon: React.FC<SvgIconProps> = ({
  src,
  className = '',
  color,
  size,
  alt,
  fallback
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    // Check error cache first
    if (errorCache.has(src)) {
      setError(true);
      return;
    }

    // Check cache first
    if (svgCache.has(src)) {
      setSvgContent(svgCache.get(src)!);
      setError(false);
      return;
    }

    // Reset state when src changes
    setSvgContent(null);
    setError(false);

    const fetchSvg = async () => {
      try {
        // Ensure the path starts with / for public folder assets
        const fetchPath = src.startsWith('/') ? src : `/${src}`;
        const response = await fetch(fetchPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();

        // Check if the response is actually an SVG (not HTML error page)
        if (!text.includes('<svg') && !text.includes('<SVG')) {
          throw new Error('Response is not an SVG file');
        }

        // Parse SVG and modify it for inline rendering
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svg = doc.querySelector('svg');

        // Check for parsing errors (DOMParser returns an error document on failure)
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          throw new Error('SVG parsing error');
        }

        if (!svg) {
          throw new Error('Invalid SVG - no svg element found');
        }

        // Remove width/height attributes to allow CSS sizing
        svg.removeAttribute('width');
        svg.removeAttribute('height');

        // Add currentColor support - replace hardcoded colors with currentColor
        // This allows the SVG to inherit color from parent
        const elements = svg.querySelectorAll('*');
        elements.forEach(el => {
          const fill = el.getAttribute('fill');
          const stroke = el.getAttribute('stroke');

          // Replace non-none fill colors with currentColor
          if (fill && fill !== 'none' && fill !== 'transparent' && !fill.startsWith('url')) {
            el.setAttribute('fill', 'currentColor');
          }

          // Replace non-none stroke colors with currentColor
          if (stroke && stroke !== 'none' && stroke !== 'transparent' && !stroke.startsWith('url')) {
            el.setAttribute('stroke', 'currentColor');
          }
        });

        // If SVG has no fill on root, add it
        if (!svg.getAttribute('fill')) {
          svg.setAttribute('fill', 'currentColor');
        }

        const processedSvg = svg.outerHTML;
        // Cache the processed SVG
        svgCache.set(src, processedSvg);

        setSvgContent(processedSvg);
        setError(false);
      } catch (err) {
        console.error('Error loading SVG:', src, err);
        errorCache.add(src);
        setError(true);
      }
    };

    fetchSvg();
  }, [src]);

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Default fallback - a simple circle placeholder
    return (
      <div
        className={`bg-gray-200 rounded ${className}`}
        style={{
          width: size || '1em',
          height: size || '1em',
          minWidth: size || '1em',
          minHeight: size || '1em'
        }}
        role="img"
        aria-label={alt || 'Icon'}
      />
    );
  }

  if (!svgContent) {
    // Loading state - render placeholder
    return (
      <div
        className={`animate-pulse bg-gray-100 rounded ${className}`}
        style={{
          width: size || '1em',
          height: size || '1em',
          minWidth: size || '1em',
          minHeight: size || '1em'
        }}
      />
    );
  }

  const sizeStyle = size
    ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }
    : {};

  const colorStyle = color ? { color } : {};

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ ...sizeStyle, ...colorStyle }}
      role="img"
      aria-label={alt || 'Icon'}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default SvgIcon;
