import { MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useToggleFavorite, useFavoriteStatus } from "@/hooks/useFavorites"
import { useFieldActiveDiscount } from "@/hooks/queries/useFieldDiscounts"
import { LoginPromptModal } from "@/components/modal/LoginPromptModal"
// import { useLocation } from "@/contexts/LocationContext" // Distance calculation disabled
// import { calculateDistance, formatDistance, getFieldCoordinates } from "@/utils/location" // Distance calculation disabled
import { getAmenityLabel, formatRating } from "@/utils/formatters"
import { getImageUrl } from "@/utils/imageUrl"
import { LazyImage } from "@/components/common/LazyImage"


export interface FieldCardProps {
  id: string
  name: string
  location: string
  distance?: string
  price: number
  price30min?: number
  price1hr?: number
  rating: number
  image: string
  amenities?: (string | { label: string; value: string })[]
  isLiked?: boolean
  isClaimed?: boolean
  onLike?: (id: string) => void
  onViewDetails?: (id: string) => void
  onBookNow?: (id: string) => void
  onClaimField?: (id: string) => void
  owner?: string
  variant?: 'compact' | 'expanded'
  showAmenityLimit?: number
  fieldLocation?: any // Can be JSON object with lat/lng or legacy lat/long fields
  latitude?: number
  longitude?: number
  fieldId?: string
  activeDiscount?: number | null // e.g. 20 for 20% off
}


export const FieldCard = React.memo(function FieldCard({
  id,
  name,
  location,
  distance: providedDistance,
  price,
  price30min,
  price1hr,
  rating,
  image,
  amenities = [],
  isLiked: propIsLiked,
  isClaimed = true,
  onLike,
  onViewDetails,
  onBookNow: _onBookNow, // Unused - navigating directly via router
  onClaimField,
  owner = "Owner",
  variant = 'compact',
  showAmenityLimit = 4,
  fieldLocation,
  latitude,
  longitude,
  fieldId,
  activeDiscount: propDiscount
}: FieldCardProps) {
  // Only fetch/show discount if feature flag is enabled
  const offersEnabled = process.env.NEXT_PUBLIC_ENABLE_OFFERS_DISCOUNTS === 'true';
  const shouldFetchDiscount = offersEnabled && propDiscount === undefined && variant === 'expanded';
  const discountFieldId = shouldFetchDiscount ? (fieldId || id) : undefined;
  const { data: fetchedDiscount } = useFieldActiveDiscount(discountFieldId);
  const activeDiscount = offersEnabled ? (propDiscount != null ? propDiscount : (fetchedDiscount ?? null)) : null;

  // Determine display price - prioritize the lowest available price
  // Check both price30min and price1hr (not legacy price to avoid showing old data)
  const has30minPrice = price30min && price30min > 0;
  const has1hrPrice = price1hr && price1hr > 0;

  const displayPrice = has30minPrice && has1hrPrice
    ? Math.min(price30min, price1hr) // Show lowest if both available
    : has30minPrice
    ? price30min
    : has1hrPrice
    ? price1hr
    : price || 0; // Fallback to legacy price only if neither new price is set

  // Check if image is valid (not null, not empty, not placeholder, not map image)
  // WordPress URLs are now considered valid images
  const isValidImage = (img: string | null | undefined): boolean => {
    if (!img || img === 'null') return false;
    const lowerImg = img.toLowerCase();

    // Placeholder images should be treated as no image
    if (lowerImg.includes('placeholder') || lowerImg.includes('/fields/field')) {
      return false;
    }

    // Must be a proper URL (starts with http)
    if (!lowerImg.startsWith('http')) {
      return false;
    }

    // Filter out Google Maps images
    if (lowerImg.includes('maps.google') ||
      lowerImg.includes('google.com/maps') ||
      lowerImg.includes('maps.googleapis.com') ||
      lowerImg.includes('staticmap') ||
      lowerImg.includes('street_view') ||
      lowerImg.includes('streetview')) {
      return false;
    }

    // Filter out other map service images
    if (lowerImg.includes('openstreetmap') ||
      lowerImg.includes('mapbox') ||
      lowerImg.includes('tile.openstreetmap') ||
      lowerImg.includes('api.mapbox')) {
      return false;
    }

    return true;
  };

  const hasValidImage = isValidImage(image);

  const isExpanded = variant === 'expanded'
  const router = useRouter()
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState('')
  const imageAspect = "aspect-[61/48]"

  // Get user location from context - Distance calculation disabled
  // const { currentLocation, isLocationEnabled } = useLocation()

  // Calculate distance if user location is available - Distance calculation disabled
  // const calculatedDistance = useMemo(() => {
  //   if (!isLocationEnabled || !currentLocation) return null

  //   // Try to get field coordinates from various sources
  //   let fieldCoords = getFieldCoordinates(fieldLocation)

  //   // Fallback to legacy latitude/longitude fields
  //   if (!fieldCoords && latitude && longitude) {
  //     fieldCoords = { lat: latitude, lng: longitude }
  //   }

  //   if (!fieldCoords) return null

  //   const distance = calculateDistance(
  //     currentLocation.lat,
  //     currentLocation.lng,
  //     fieldCoords.lat,
  //     fieldCoords.lng
  //   )

  //   return formatDistance(distance)
  // }, [currentLocation, isLocationEnabled, fieldLocation, latitude, longitude])

  // Use calculated distance if available, otherwise fall back to provided distance - Distance calculation disabled
  // const displayDistance = calculatedDistance || providedDistance

  // Favorite status and toggle
  // Only fetch favorite status if not provided via props (avoids N+1 API calls)
  const shouldFetchFavoriteStatus = propIsLiked === undefined
  const { data: isFavorited } = useFavoriteStatus(shouldFetchFavoriteStatus ? id : undefined)
  const toggleFavoriteMutation = useToggleFavorite(id)
  const [isLiked, setIsLiked] = useState(propIsLiked ?? false)

  useEffect(() => {
    // Use prop value if provided, otherwise use fetched value
    if (propIsLiked !== undefined) {
      setIsLiked(propIsLiked)
    } else if (isFavorited !== undefined) {
      setIsLiked(isFavorited)
    }
  }, [isFavorited, propIsLiked])

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      setLoginModalMessage('Please login or sign up to save your favorite fields')
      setShowLoginModal(true)
      return
    }

    try {
      const result = await toggleFavoriteMutation.mutateAsync()
      setIsLiked(result.isFavorited)
      onLike?.(id)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isClaimed) {
      // For unclaimed fields, allow claiming without login
      onClaimField?.(id)
    } else {
      // Navigate directly to book-field page for all users (logged in or not)
      // Login prompt will be shown on book-field page when they click Continue
      router.push(`/fields/book-field?id=${fieldId || id}`)
    }
  }

  const detailsHref = `/fields/${fieldId || id}`

  const containerClasses = isExpanded
    ? "block bg-white rounded-[20px] border border-black/[0.08] w-full min-w-[280px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow no-underline text-inherit"
    : "block bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_20px_0px_rgba(0,0,0,0.12)] transition-all min-w-[280px] cursor-pointer no-underline text-inherit"

  const imageHeight = isExpanded ? "h-[320px]" : "h-[200px]"
  const imageRoundness = isExpanded ? "rounded-[32px]" : "rounded-[12px]"
  const padding = isExpanded ? "p-4" : "px-3 py-3"

  if (isExpanded) {
    return (
      <>
        <Link href={detailsHref} className={containerClasses}>
          <div className={padding}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-2 min-w-0">
                <h3 className="text-[15px] font-bold text-dark-green  leading-[20px] line-clamp-1 ">{name}</h3>
                {/* <p className="text-[12px] text-[#8d8d8d] leading-[16px]">Posted by {owner}</p> */}
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-[#3A6B22] leading-[18px]">
                  From £{displayPrice}
                </p>
              </div>
            </div>

            <div className="relative mb-4 ">
              <div className={`relative w-full ${imageAspect} overflow-hidden ${imageRoundness}`}>
                {hasValidImage ? (
                  <LazyImage
                    src={getImageUrl(image)}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover"
                    placeholder="/placeholder-field.jpg"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <div className="text-center text-green-700/60">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">No image</span>
                    </div>
                  </div>
                )}
                {activeDiscount != null && activeDiscount > 0 && (
                  <div className="absolute top-2 left-2 bg-[#192215] text-white text-[11px] font-bold px-2.5 py-1 rounded-tl-[12px] rounded-br-[10px] z-10">
                    {activeDiscount}% OFF
                  </div>
                )}
              </div>

              <button
                onClick={handleToggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center shadow-md disabled:opacity-50"
              >
                {isLiked ? (
                  <img src="/field-details/saved-heart.svg" alt="Saved" className="w-5 h-5" loading="lazy" />
                ) : (
                  <img src="/field-details/gray-heart.svg" alt="Save" className="w-5 h-5" loading="lazy" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center mb-2 px-0">
              <div className="flex items-center gap-1 flex-1 pr-2">
                <img src="/location.svg" alt="Location" className="w-5 h-5 text-[#3A6B22] flex-shrink-0" />
                <span className="text-[12px] text-dark-green leading-[16px]">
                  {location}
                </span>
              </div>
              <div className="bg-dark-green rounded-md px-1.5 py-1 flex items-center gap-0.5">
                <img src='/star.svg' className="w-3.5 h-3.5 fill-yellow text-yellow" />
                <span className="text-[12px] font-semibold text-white">{formatRating(rating).toFixed(1)}</span>
              </div>
            </div>

            {/* Amenities tags - temporarily hidden
            <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
              {amenities.length > 0 ? (
                amenities.slice(0, showAmenityLimit).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="bg-neutral-100 text-[11px] text-dark-green px-2 py-1 rounded-md leading-[16px]"
                  >
                    {typeof amenity === 'string' ? getAmenityLabel(amenity) : amenity.label}
                  </span>
                ))
              ) : (
                <span className="invisible text-[11px] px-2 py-1">&nbsp;</span>
              )}
            </div>
            */}

            <div className="flex gap-3">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewDetails?.(id); }}
                className="flex-1 border border-[#3A6B22] text-[#3A6B22] text-[14px] font-semibold py-2 rounded-[70px] hover:bg-[#3A6B22] hover:text-white transition-colors"
              >
                View Details
              </button>
              {isClaimed && (
                <button
                  onClick={handleBookNowClick}
                  className="flex-1 bg-[#3A6B22] text-white text-[14px] font-semibold py-2 rounded-[70px] hover:bg-[#2d5a1b] transition-colors"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </Link>

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message={loginModalMessage}
        />
      </>
    )
  }

  return (
    <>
      <Link href={detailsHref} className={containerClasses}>
        <div className="px-3 pt-3 pb-2">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[13px] font-semibold text-dark-green flex-1 line-clamp-1 min-w-0 pr-2">
              {name}
            </h3>
            <div className="text-right">
              <span className="text-[12px] font-bold text-dark-green block">From £{displayPrice}</span>
            </div>
          </div>
          {/* <p className="text-[10px] text-gray-500">Posted by: {owner}</p> */}
        </div>

        <div className={`relative ${imageHeight} mx-3 mb-3 ${imageRoundness} overflow-hidden`}>
          {hasValidImage ? (
            <LazyImage
              src={getImageUrl(image)}
              alt={name}
              className="w-full h-full object-cover"
              placeholder="/placeholder-field.jpg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <div className="text-center text-green-700/60">
                <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-medium">No image</span>
              </div>
            </div>
          )}

          {activeDiscount != null && activeDiscount > 0 && (
            <div className="absolute top-0 left-0 bg-[#192215] text-white text-[10px] font-bold px-2 py-1 rounded-tl-[12px] rounded-br-[10px] z-10">
              {activeDiscount}% OFF
            </div>
          )}

          <button
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
          >
            {isLiked ? (
              <img src="/field-details/saved-heart.svg" alt="Saved" className="w-4 h-4" loading="lazy" />
            ) : (
              <img src="/field-details/gray-heart.svg" alt="Save" className="w-4 h-4" loading="lazy" />
            )}
          </button>

          <div className="absolute bottom-2 left-2 bg-black/90 px-2 py-0.5 rounded-md flex items-center gap-0.5">
            <span className="text-white text-[10px] font-medium">★ {formatRating(rating).toFixed(1)}</span>
          </div>
        </div>


        <div className="px-3 pb-3">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>

          {/* Amenities tags - temporarily hidden
          <div className="flex gap-1 mb-3 flex-wrap min-h-[22px]">
            {amenities.length > 0 ? (
              amenities.slice(0, showAmenityLimit).map((amenity, index) => (
                <span
                  key={index}
                  className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {getAmenityLabel(amenity)}
                </span>
              ))
            ) : (
              <span className="invisible text-[9px] px-2 py-0.5">&nbsp;</span>
            )}
          </div>
          */}

          <div className="flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewDetails?.(id); }}
              className="flex-1 py-1.5 text-[10px] font-medium text-[#3a6b22] border border-[#3a6b22] rounded-full hover:bg-[#3a6b22]/5 transition-colors"
            >
              View Details
            </button>
            {isClaimed && (
              <button
                onClick={handleBookNowClick}
                className="flex-1 py-1.5 text-[10px] font-medium text-white bg-[#3a6b22] rounded-full hover:bg-[#2a5b12] transition-colors"
              >
                Book Now
              </button>
            )}
          </div>

        </div>

      </Link>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginModalMessage}
      />
    </>
  )
});

