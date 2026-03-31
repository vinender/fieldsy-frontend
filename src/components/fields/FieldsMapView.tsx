import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { FieldCard } from '@/components/fields/FieldCard';

// UK-centered map defaults
const UK_CENTER = {
  lat: 53.0,
  lng: -1.5,
};

const UK_BOUNDS = {
  north: 59.5,
  south: 49.5,
  west: -8.5,
  east: 2.0,
};

const MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '20px',
};

const mapOptions: google.maps.MapOptions = {
  restriction: {
    latLngBounds: UK_BOUNDS,
    strictBounds: false,
  },
  styles: MAP_STYLES,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
};

/** Extract lat/lng from various field data formats */
function getFieldCoords(field: any): { lat: number; lng: number } | null {
  if (field.location?.lat && field.location?.lng) {
    return { lat: field.location.lat, lng: field.location.lng };
  }
  if (field.latitude && field.longitude) {
    return { lat: field.latitude, lng: field.longitude };
  }
  if (field.location?.coordinates && Array.isArray(field.location.coordinates)) {
    return { lat: field.location.coordinates[1], lng: field.location.coordinates[0] };
  }
  return null;
}

interface FieldsMapViewProps {
  fields: any[];
}

/** Generate a canvas-based marker icon with field image inside a pin shape */
/** Load an image and return a promise */
function loadImage(src: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/** Pre-load SVG pin images */
let pinCache: { dark?: HTMLImageElement; active?: HTMLImageElement } = {};
async function loadPinSVGs() {
  if (!pinCache.dark) {
    pinCache.dark = await loadImage('/map/dark-map-icon.svg');
  }
  if (!pinCache.active) {
    pinCache.active = await loadImage('/map/active-map-icon.svg');
  }
  return pinCache;
}

function useMarkerIcons(fields: any[]) {
  const [icons, setIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined' || fields.length === 0) return;

    let cancelled = false;

    const generateIcon = async (
      canvas: HTMLCanvasElement,
      pinImg: HTMLImageElement,
      fieldImage: string | null,
      isActive: boolean,
    ) => {
      // Use the SVG's natural aspect ratio
      const w = isActive ? 58 : 34;
      const h = isActive ? 65 : 40;
      canvas.width = w * 2; // 2x for retina
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.clearRect(0, 0, w, h);

      // Draw the SVG pin background
      ctx.drawImage(pinImg, 0, 0, w, h);

      // Calculate circle position — center of the pin's round head
      // Dark pin: 34x40 viewBox, head center at (17, 16.5) with radius ~14
      // Active pin: 58x65 viewBox, head center at (28.5, 21.9) with radius ~19
      const cx = isActive ? 29 : 17;
      const cy = isActive ? 22 : 15;
      const imgR = isActive ? 15 : 11;
      const borderW = 2;

      // White circle border
      ctx.beginPath();
      ctx.arc(cx, cy, imgR + borderW, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();

      // Draw field image clipped to circle
      if (fieldImage && fieldImage !== 'null' && fieldImage.startsWith('http')) {
        try {
          // Use Next.js image optimizer as CORS proxy for external images
          // S3 images with proper CORS can be loaded directly
          const isDirectLoadable = fieldImage.includes('amazonaws.com') || fieldImage.includes('fieldsy-s3') || fieldImage.includes('googleusercontent.com');
          let imgSrc = fieldImage;
          if (!isDirectLoadable) {
            // Proxy through Next.js /_next/image to avoid CORS issues
            imgSrc = `/_next/image?url=${encodeURIComponent(fieldImage)}&w=128&q=75`;
          }
          const img = await loadImage(imgSrc, 'anonymous');
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, imgR, 0, Math.PI * 2);
          ctx.clip();
          const srcSize = Math.min(img.width, img.height);
          const sx = (img.width - srcSize) / 2;
          const sy = (img.height - srcSize) / 2;
          ctx.drawImage(img, sx, sy, srcSize, srcSize, cx - imgR, cy - imgR, imgR * 2, imgR * 2);
          ctx.restore();
        } catch {
          // Fallback — green circle with initial letter
          ctx.beginPath();
          ctx.arc(cx, cy, imgR, 0, Math.PI * 2);
          ctx.fillStyle = '#8FB366';
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = `bold ${Math.round(imgR * 0.8)}px "DM Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
        }
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, imgR, 0, Math.PI * 2);
        ctx.fillStyle = '#8FB366';
        ctx.fill();
      }

      // Try toDataURL — if canvas is tainted, return null
      try {
        return canvas.toDataURL('image/png');
      } catch {
        return null;
      }
    };

    (async () => {
      try {
        const pins = await loadPinSVGs();
        const newIcons: Record<string, string> = {};

        for (let i = 0; i < fields.length; i++) {
          if (cancelled) return;
          const field = fields[i];
          const fieldImg = field?.image || null;
          console.log(';;field', field)

          // Fresh canvas per field — prevents CORS taint from poisoning other icons
          const darkCanvas = document.createElement('canvas');
          const darkIcon = await generateIcon(darkCanvas, pins.dark!, fieldImg, false);
          if (darkIcon) newIcons[field.id] = darkIcon;

          const activeCanvas = document.createElement('canvas');
          const activeIcon = await generateIcon(activeCanvas, pins.active!, fieldImg, true);
          if (activeIcon) newIcons[`${field.id}_active`] = activeIcon;

          // Update state every 5 fields for progressive rendering
          if ((i + 1) % 5 === 0 || i === fields.length - 1) {
            if (!cancelled) setIcons({ ...newIcons });
          }
        }
      } catch (err) {
        console.error('[FieldsMapView] Failed to generate marker icons:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [fields]);

  return icons;
}

/** Helper to build location display string from field data */
function getFieldLocation(field: any): string {
  return field.locationDisplay ||
    field.location?.formatted_address ||
    field.address ||
    [field.location?.city, field.location?.state].filter(Boolean).join(', ') ||
    'Location not available';
}

export default function FieldsMapView({ fields }: FieldsMapViewProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const markerClickedRef = useRef(false);
  const markerIcons = useMarkerIcons(fields);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries: ['places'],
  });

  // Add coords to each field
  const mappableFields = useMemo(() => {
    return fields
      .map((f) => {
        const coords = getFieldCoords(f);
        return coords ? { ...f, _coords: coords } : null;
      })
      .filter(Boolean) as any[];
  }, [fields]);

  const selectedField = useMemo(
    () => mappableFields.find((f) => f.id === selectedFieldId) || null,
    [mappableFields, selectedFieldId],
  );

  // Fit map to markers
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapRef(map);
      if (mappableFields.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        mappableFields.forEach((f) => bounds.extend(f._coords));
        map.fitBounds(bounds, 60);
        if (mappableFields.length === 1) {
          setTimeout(() => map.setZoom(13), 300);
        }
      }
    },
    [mappableFields],
  );

  if (loadError) {
    return (
      <div className="w-full h-[700px] bg-gray-100 rounded-[20px] flex items-center justify-center">
        <p className="text-gray-500">Failed to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[700px] bg-gray-100 rounded-[20px] animate-pulse flex items-center justify-center">
        <p className="text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="fields-map-view relative w-full h-[700px] rounded-[20px] overflow-hidden border border-black/[0.08]">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={UK_CENTER}
        zoom={6}
        options={mapOptions}
        onLoad={handleMapLoad}
        onClick={() => setSelectedFieldId(null)}
      >
        {mappableFields.map((field) => {
          const isSelected = selectedFieldId === field.id;
          const iconKey = isSelected ? `${field.id}_active` : field.id;
          const iconUrl = markerIcons[iconKey];
          // Fallback to SVG if canvas icon not ready yet
          const fallbackUrl = isSelected ? '/map/active-map-icon.svg' : '/map/dark-map-icon.svg';

          return (
            <Marker
              key={field.id}
              position={field._coords}
              icon={{
                url: iconUrl || fallbackUrl,
                scaledSize: isSelected
                  ? new google.maps.Size(58, 65)
                  : new google.maps.Size(46, 54),
                anchor: isSelected
                  ? new google.maps.Point(29, 60)
                  : new google.maps.Point(23, 50),
              }}
              onClick={() => setSelectedFieldId(field.id)}
              zIndex={isSelected ? 100 : 1}
            />
          );
        })}

        {selectedField && (
          <InfoWindow
            position={selectedField._coords}
            onCloseClick={() => setSelectedFieldId(null)}
            options={{
              pixelOffset: new google.maps.Size(-12, -50),
              maxWidth: 380,
            }}
          >
            <div style={{ width: 340 }}>
              <FieldCard
                id={selectedField._objectId || selectedField.id}
                fieldId={selectedField.id}
                name={selectedField.name}
                location={getFieldLocation(selectedField)}
                distance={selectedField.distanceDisplay}
                price={selectedField.price || 0}
                price30min={selectedField.price30min}
                price1hr={selectedField.price1hr}
                rating={selectedField.rating || 0}
                image={selectedField.image || ''}
                amenities={selectedField.amenities || []}
                isLiked={selectedField.isLiked}
                isClaimed={selectedField.isClaimed}
                owner={selectedField.owner}
                variant="expanded"
              />
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Field count badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
        <span className="text-sm font-medium text-[#192215]">
          {mappableFields.length} field{mappableFields.length !== 1 ? 's' : ''} on map
        </span>
      </div>
    </div>
  );
}
