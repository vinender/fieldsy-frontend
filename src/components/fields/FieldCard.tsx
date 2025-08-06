import { Heart, MapPin } from "lucide-react"
import Image from "next/image"

interface FieldCardProps {
  id: string
  name: string
  location: string
  distance: string
  price: number
  priceUnit: string
  rating: number
  image: string
  amenities?: string[]
  isLiked?: boolean
  onLike?: () => void
  owner?: string
}

export function FieldCard({
  name,
  location,
  distance,
  price,
  priceUnit,
  rating,
  image,
  amenities = [],
  isLiked = false,
  onLike,
  owner = "Owner"
}: FieldCardProps) {
  return (
    <div className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_20px_0px_rgba(0,0,0,0.12)] transition-all">
      {/* Header with Name and Price */}
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

      {/* Image Container with rounded corners */}
      <div className="relative h-[200px] mx-3 mb-3 rounded-[12px] overflow-hidden">
        <Image 
          src={image} 
          alt={name}
          fill
          className="object-cover"
        />
        
        {/* Like Button - White circle with heart */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onLike?.()
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>

        {/* Rating Badge - Black rectangle bottom left */}
        <div className="absolute bottom-2 left-2 bg-black/90 px-2 py-0.5 rounded-md flex items-center gap-0.5">
          <span className="text-white text-[10px] font-medium">★ {rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {/* Location with icon */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
          <MapPin className="w-3 h-3" />
          <span>{location} • {distance}</span>
        </div>

        {/* Amenities Tags */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {amenities.slice(0, 2).map((amenity, index) => (
            <span 
              key={index}
              className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
            >
              {amenity}
            </span>
          ))}
          {amenities.length > 2 && (
            <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              Shelter
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 py-1.5 text-[10px] font-medium text-[#3a6b22] border border-[#3a6b22] rounded-full hover:bg-[#3a6b22]/5 transition-colors">
            View Details
          </button>
          <button className="flex-1 py-1.5 text-[10px] font-medium text-white bg-[#3a6b22] rounded-full hover:bg-[#2a5b12] transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}