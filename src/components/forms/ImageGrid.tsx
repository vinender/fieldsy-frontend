import React from "react"

interface ImageData {
  src: string
  alt: string
  isCenter?: boolean
}

interface ImageGridProps {
  images: ImageData[]
  title: string
  description: string
}

export function ImageGrid({ images, title, description }: ImageGridProps) {
  return (
    <div className="hidden lg:flex w-1/2 bg-gray-100 relative">
      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2 p-4 w-full h-full">
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`relative overflow-hidden ${image.isCenter ? 'ring-4 ring-pink-500 rounded-lg' : ''}`}
          >
            <img 
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {/* Center image indicator */}
            {image.isCenter && (
              <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                D
              </div>
            )}
          </div>
        ))}
      </div>

      {/* White cloudy overlay effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/0" />
        <div className="absolute bottom-0 left-0 right-0 h-[700px] bg-gradient-to-t from-white/100 to-transparent" />
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-8 left-8 right-8 z-10">
        <h2 className="font-[800] text-[32px] leading-[58px] mb-3 text-green">
          {title}
        </h2>
        <p className="text-dark-green/40 font-[400] text-[16px] leading-[24px]">
          {description}
        </p>
      </div>
    </div>
  )
}