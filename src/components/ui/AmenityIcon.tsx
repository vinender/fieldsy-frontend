import React from 'react';
import { cn } from '@/lib/utils';

interface AmenityIconProps {
    src: string;
    alt?: string;
    className?: string;
    active?: boolean;
    fillColor?: string; // Explicit color override
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({
    src,
    alt,
    className,
    active,
    fillColor
}) => {
    // CSS Filters to approximate colors (calculated from hex)
    // Black #000000
    const filterBlack = 'brightness(0) saturate(100%)';

    // Dark Green #3a6b22 (Active state)
    const filterDarkGreen = 'brightness(0) saturate(100%) invert(34%) sepia(94%) saturate(366%) hue-rotate(65deg) brightness(94%) contrast(90%)';

    // Bright Green #22C55E (Field Details)
    const filterBrightGreen = 'brightness(0) saturate(100%) invert(66%) sepia(68%) saturate(464%) hue-rotate(88deg) brightness(92%) contrast(93%)';

    let filter = filterBlack;

    if (fillColor === '#22C55E') {
        filter = filterBrightGreen;
    } else if (active || fillColor === '#3a6b22') {
        filter = filterDarkGreen;
    }

    return (
        <div className={cn("w-full h-full flex items-center justify-center", className)}>
            <img
                src={src}
                alt={alt || 'Amenity icon'}
                className="w-full h-full object-contain"
                style={{
                    filter: filter,
                    WebkitFilter: filter,
                }}
            />
        </div>
    );
};
