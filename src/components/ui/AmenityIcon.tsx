import React from 'react';
import { cn } from '@/lib/utils';

interface AmenityIconProps {
    src: string;
    alt?: string;
    className?: string;
    active?: boolean;
    fillColor?: string; // Explicit color override
    size?: number;
}

/**
 * AmenityIcon component that renders SVG icons with proper styling
 * Uses img tag with CSS filter for color control - works with remote SVGs
 */
export const AmenityIcon: React.FC<AmenityIconProps> = ({
    src,
    alt,
    className,
    active = true,  // Default to green color
    size
}) => {
    return (
        <div className={cn("w-full h-full flex items-center justify-center", className)}>
            <img
                src={src}
                alt={alt || 'Amenity icon'}
                className="w-full h-full object-contain"
                style={{
                    width: size ? `${size}px` : '100%',
                    height: size ? `${size}px` : '100%',
                    // Use CSS filter to make the icon black (or green when active)
                    filter: active
                        ? 'brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(497%) hue-rotate(75deg) brightness(97%) contrast(88%)'
                        : 'brightness(0)', // Black color
                }}
                onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
        </div>
    );
};
