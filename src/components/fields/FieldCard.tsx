import { MapPin, Star } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useToggleFavorite, useFavoriteStatus } from "@/hooks/useFavorites"
import { LoginPromptModal } from "@/components/modal/LoginPromptModal"
import { useLocation } from "@/contexts/LocationContext"
import { calculateDistance, formatDistance, getFieldCoordinates } from "@/utils/location"

export interface FieldCardProps {
  id: string
  name: string
  location: string
  distance?: string
  price: number
  priceUnit?: string
  rating: number
  image: string
  amenities?: string[]
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
}

export function FieldCard({
  id,
  name,
  location,
  distance: providedDistance,
  price,
  priceUnit = "dog/hour",
  rating,
  image,
  amenities = [],
  isLiked: propIsLiked = false,
  isClaimed = true,
  onLike,
  onViewDetails,
  onBookNow,
  onClaimField,
  owner = "Owner",
  variant = 'compact',
  showAmenityLimit = 2,
  fieldLocation,
  latitude,
  longitude
}: FieldCardProps) {
  const isExpanded = variant === 'expanded'
  const router = useRouter()
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState('')
  
  // Get user location from context
  const { currentLocation, isLocationEnabled } = useLocation()
  
  // Calculate distance if user location is available
  const calculatedDistance = useMemo(() => {
    if (!isLocationEnabled || !currentLocation) return null
    
    // Try to get field coordinates from various sources
    let fieldCoords = getFieldCoordinates(fieldLocation)
    
    // Fallback to legacy latitude/longitude fields
    if (!fieldCoords && latitude && longitude) {
      fieldCoords = { lat: latitude, lng: longitude }
    }
    
    if (!fieldCoords) return null
    
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      fieldCoords.lat,
      fieldCoords.lng
    )
    
    return formatDistance(distance)
  }, [currentLocation, isLocationEnabled, fieldLocation, latitude, longitude])
  
  // Use calculated distance if available, otherwise fall back to provided distance
  const displayDistance = calculatedDistance || providedDistance
  
  // Favorite status and toggle
  const { data: isFavorited } = useFavoriteStatus(id)
  const toggleFavoriteMutation = useToggleFavorite(id)
  const [isLiked, setIsLiked] = useState(propIsLiked)
  
  useEffect(() => {
    setIsLiked(isFavorited || propIsLiked)
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
    } else if (!session) {
      setLoginModalMessage('Please login or sign up to book this field')
      setShowLoginModal(true)
    } else {
      onBookNow?.(id)
    }
  }
  
  const containerClasses = isExpanded 
    ? "bg-white rounded-[20px] border border-black/[0.08] w-full overflow-hidden"
    : "bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_20px_0px_rgba(0,0,0,0.12)] transition-all"
  
  const imageHeight = isExpanded ? "h-[320px]" : "h-[200px]"
  const imageRoundness = isExpanded ? "rounded-[32px]" : "rounded-[12px]"
  const padding = isExpanded ? "p-4" : "px-3 py-3"
  
  if (isExpanded) {
    return (
      <>
      <div className={containerClasses}>
        <div className={padding}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-2">
              <h3 className="text-[15px] font-bold text-dark-green leading-[20px]">{name}</h3>
              <p className="text-[12px] text-[#8d8d8d] leading-[16px]">Posted by {owner}</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-bold text-[#3A6B22] leading-[20px]">${price}</p>
              <p className="text-[13px] text-[#8d8d8d] leading-[16px]">/{priceUnit}</p>
            </div>
          </div>

          <div className="relative mb-4">
            <div className={imageHeight + " w-full"}>
              <img 
                src={image} 
                alt={name} 
                className={`w-full h-full object-cover ${imageRoundness}`}
              />
            </div>
            <button 
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteMutation.isPending}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center shadow-md disabled:opacity-50"
            >
              {isLiked ? (
                <img src="/field-details/saved-heart.svg" alt="Saved" className="w-5 h-5" />
              ) : (
                <img src="/field-details/gray-heart.svg" alt="Save" className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center mb-2 px-0">
            <div className="flex items-center gap-1 flex-1 pr-2">
              <MapPin className="w-5 h-5 text-[#3A6B22] flex-shrink-0" />
              <span className="text-[12px] text-dark-green leading-[16px]">
                {location}{displayDistance ? ` • ${displayDistance}` : ''}
              </span>
            </div>
            <div className="bg-dark-green rounded-md px-1.5 py-1 flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-yellow text-yellow" fill="white" />
              <span className="text-[12px] font-semibold text-white">{rating}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities.map((amenity, idx) => (
              <span 
                key={idx} 
                className="bg-neutral-100 text-[11px] text-dark-green px-2 py-1 rounded-md leading-[16px]"
              >
                {amenity}
              </span>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => onViewDetails?.(id)}
              className="flex-1 border border-[#3A6B22] text-[#3A6B22] text-[14px] font-semibold py-2 rounded-[70px] hover:bg-[#3A6B22] hover:text-white transition-colors"
            >
              View Details
            </button>
            <button 
              onClick={handleBookNowClick}
              className="flex-1 bg-[#3A6B22] text-white text-[14px] font-semibold py-2 rounded-[70px] hover:bg-[#2d5a1b] transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
      
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
    <div className={containerClasses}>
      <div className="px-3 pt-3 pb-2">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[13px] font-semibold text-dark-green flex-1 line-clamp-1">
            {name}
          </h3>
          <div className="text-right">
            <span className="text-[16px] font-bold text-dark-green">${price}</span>
            <span className="text-[10px] text-gray-500 block">/{priceUnit}</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500">Posted by: {owner}</p>
      </div>

      <div className={`relative ${imageHeight} mx-3 mb-3 ${imageRoundness} overflow-hidden`}>
        <Image 
          src={image} 
          alt={name}
          fill
          className="object-cover"
        />
        
        <button
          onClick={handleToggleFavorite}
          disabled={toggleFavoriteMutation.isPending}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
        >
          {isLiked ? (
            <img src="/field-details/saved-heart.svg" alt="Saved" className="w-4 h-4" />
          ) : (
            <img src="/field-details/gray-heart.svg" alt="Save" className="w-4 h-4" />
          )}
        </button>

        <div className="absolute bottom-2 left-2 bg-black/90 px-2 py-0.5 rounded-md flex items-center gap-0.5">
          <span className="text-white text-[10px] font-medium">★ {rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
          <MapPin className="w-3 h-3" />
          <span>{location}{displayDistance ? ` • ${displayDistance}` : ''}</span>
        </div>

        <div className="flex gap-1 mb-3 flex-wrap">
          {amenities.slice(0, showAmenityLimit).map((amenity, index) => (
            <span 
              key={index}
              className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
            >
              {amenity}
            </span>
          ))}
          {amenities.length > showAmenityLimit && (
            <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              +{amenities.length - showAmenityLimit} more
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails?.(id)}
            className="flex-1 py-1.5 text-[10px] font-medium text-[#3a6b22] border border-[#3a6b22] rounded-full hover:bg-[#3a6b22]/5 transition-colors"
          >
            View Details
          </button>
          <button 
            onClick={handleBookNowClick}
            className="flex-1 py-1.5 text-[10px] font-medium text-white bg-[#3a6b22] rounded-full hover:bg-[#2a5b12] transition-colors"
          >
            {isClaimed ? 'Book Now' : 'Claim Field'}
          </button>
        </div>
      </div>
      
    </div>
    
    {/* Login Prompt Modal */}
    <LoginPromptModal 
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      message={loginModalMessage}
    />
    </>
  )
}