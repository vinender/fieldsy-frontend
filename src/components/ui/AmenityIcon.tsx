import React from 'react';
import { cn } from '@/lib/utils';
import { SvgIcon } from './SvgIcon';

interface AmenityIconProps {
    src: string;
    alt?: string;
    className?: string;
    active?: boolean;
    fillColor?: string; // Explicit color override
    size?: number;
}

/**
 * AmenityIcon component that uses SvgIcon for proper fill color support
 * Replaces the CSS filter-based approach with inline SVG rendering
 */
export const AmenityIcon: React.FC<AmenityIconProps> = ({
    src,
    alt,
    className,
    active,
    fillColor,
    size
}) => {
    // Determine the color based on props
    let color = '#000000'; // Default black

    if (fillColor) {
        color = fillColor;
    } else if (active) {
        color = '#3a6b22'; // Dark green for active state
    }

    return (
        <div className={cn("w-full h-full flex items-center justify-center", className)}>
            <SvgIcon
                src={src}
                color={color}
                size={size || '100%'}
                alt={alt || 'Amenity icon'}
                className="w-full h-full"
            />
        </div>
    );
};
