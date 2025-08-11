import { Heart, MapPin, Star } from "lucide-react"
import Image from "next/image"

export interface FieldCardProps {
  id: string
  name: string
  location: string
  distance: string
  price: number
  priceUnit?: string
  rating: number
  image: string
  amenities?: string[]
  isLiked?: boolean
  onLike?: (id: string) => void
  onViewDetails?: (id: string) => void
  onBookNow?: (id: string) => void
  owner?: string
  variant?: 'compact' | 'expanded'
  showAmenityLimit?: number
}

export function FieldCard({
  id,
  name,
  location,
  distance,
  price,
  priceUnit = "dog/hour",
  rating,
  image,
  amenities = [],
  isLiked = false,
  onLike,
  onViewDetails,
  onBookNow,
  owner = "Owner",
  variant = 'compact',
  showAmenityLimit = 2
}: FieldCardProps) {
  const isExpanded = variant === 'expanded'
  
  const containerClasses = isExpanded 
    ? "bg-white rounded-[20px] border border-black/[0.08] w-full overflow-hidden"
    : "bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_20px_0px_rgba(0,0,0,0.12)] transition-all"
  
  const imageHeight = isExpanded ? "h-[320px]" : "h-[200px]"
  const imageRoundness = isExpanded ? "rounded-[32px]" : "rounded-[12px]"
  const padding = isExpanded ? "p-4" : "px-3 py-3"
  
  if (isExpanded) {
    return (
      <div className={containerClasses}>
        <div className={padding}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-2">
              <h3 className="text-[15px] font-bold text-[#192215] leading-[20px]">{name}</h3>
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
              onClick={(e) => {
                e.preventDefault()
                onLike?.(id)
              }}
              className="absolute top-2 right-2 bg-white/20 backdrop-blur-[1.5px] border border-white/20 rounded-[19px] w-[33px] h-[34px] flex items-center justify-center"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''} text-white`} />
            </button>
          </div>

          <div className="flex justify-between items-center mb-2 px-0">
            <div className="flex items-center gap-1 flex-1 pr-2">
              <MapPin className="w-5 h-5 text-[#3A6B22] flex-shrink-0" />
              <span className="text-[12px] text-[#192215] leading-[16px]">
                {location} • {distance}
              </span>
            </div>
            <div className="bg-[#192215] rounded-md px-1.5 py-1 flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 text-white" fill="white" />
              <span className="text-[12px] font-semibold text-white">{rating}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities.map((amenity, idx) => (
              <span 
                key={idx} 
                className="bg-neutral-100 text-[11px] text-[#192215] px-2 py-1 rounded-md leading-[16px]"
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
              onClick={() => onBookNow?.(id)}
              className="flex-1 bg-[#3A6B22] text-white text-[14px] font-semibold py-2 rounded-[70px] hover:bg-[#2d5a1b] transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={containerClasses}>
      <div className="px-3 pt-3 pb-2">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[13px] font-semibold text-[#192215] flex-1 line-clamp-1">
            {name}
          </h3>
          <div className="text-right">
            <span className="text-[16px] font-bold text-[#192215]">${price}</span>
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
          onClick={(e) => {
            e.preventDefault()
            onLike?.(id)
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>

        <div className="absolute bottom-2 left-2 bg-black/90 px-2 py-0.5 rounded-md flex items-center gap-0.5">
          <span className="text-white text-[10px] font-medium">★ {rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
          <MapPin className="w-3 h-3" />
          <span>{location} • {distance}</span>
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
            onClick={() => onBookNow?.(id)}
            className="flex-1 py-1.5 text-[10px] font-medium text-white bg-[#3a6b22] rounded-full hover:bg-[#2a5b12] transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}