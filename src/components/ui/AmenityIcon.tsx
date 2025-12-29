import React from 'react';
import { cn } from '@/lib/utils';
import { SvgIcon } from '@/components/ui/SvgIcon';

// Color constants for reuse across components
export const ICON_COLORS = {
    green: '#3A6B22',
    black: '#000000',
    gray: '#6B7280',
    white: '#FFFFFF',
} as const;

interface AmenityIconProps {
    src: string;
    alt?: string;
    className?: string;
    active?: boolean;
    color?: string; // Direct color override (e.g., '#000000', 'black', ICON_COLORS.black)
    size?: number;
}

/**
 * AmenityIcon component that renders icons with proper styling
 * For local SVG icons: Uses SvgIcon component for proper color control via currentColor
 * For remote images (jpg, png, webp, etc.): Displays as-is
 *
 * @example
 * // Green icon (default when active)
 * <AmenityIcon src="/icons/water.svg" active={true} />
 *
 * // Black icon
 * <AmenityIcon src="/icons/water.svg" active={false} />
 * <AmenityIcon src="/icons/water.svg" color={ICON_COLORS.black} />
 * <AmenityIcon src="/icons/water.svg" color="#000000" />
 */
export const AmenityIcon: React.FC<AmenityIconProps> = ({
    src,
    alt,
    className,
    active = true,  // Default to green color
    color,          // Direct color override
    size
}) => {
    // Determine the icon color: explicit color prop takes priority, then active state
    const iconColor = color || (active ? ICON_COLORS.green : ICON_COLORS.black);

    // Check if the src is an SVG file and is a local path (not a remote URL)
    const isSvg = src?.toLowerCase().endsWith('.svg');
    const isLocalPath = src?.startsWith('/') && !src?.startsWith('//');

    // Use SvgIcon for local SVG files to properly control fill color
    if (isSvg && isLocalPath) {
        return (
            <SvgIcon
                src={src}
                alt={alt || 'Amenity icon'}
                size={size || 16}
                color={iconColor}
                className={className}
                fallback={
                    <div
                        className="bg-gray-200 rounded"
                        style={{ width: size || 16, height: size || 16 }}
                    />
                }
            />
        );
    }

    // For remote images (webp, jpg, png from S3, etc.), apply CSS filter for green tint
    // CSS filter to convert black/dark icons to green (#3A6B22)
    // This filter approximates the green color: brightness(0) makes it black, then sepia + hue-rotate + saturate adjust to green
    const greenFilter = iconColor === ICON_COLORS.green
        ? 'brightness(0) saturate(100%) invert(32%) sepia(45%) saturate(749%) hue-rotate(67deg) brightness(95%) contrast(92%)'
        : iconColor === ICON_COLORS.black
        ? 'brightness(0)'
        : undefined;

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <img
                src={src}
                alt={alt || 'Amenity icon'}
                className="object-contain"
                style={{
                    width: size ? `${size}px` : '100%',
                    height: size ? `${size}px` : '100%',
                    filter: greenFilter,
                }}
                onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
        </div>
    );
};
