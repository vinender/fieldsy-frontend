"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageLightboxProps {
  images: string[]
  open: boolean
  initialIndex?: number
  onOpenChange: (open: boolean) => void
}

export function ImageLightbox({ images, open, initialIndex = 0, onOpenChange }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  if (!images || images.length === 0) return null

  const goPrev = () => setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  const goNext = () => setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))

  const hasMultipleImages = images.length > 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-5xl p-0 overflow-hidden  border-none rounded-2xl">
        {/* Custom close button with white background in top right */}
        <DialogClose className="absolute -right-0 -top-0  z-50 rounded-full bg-gray-50 p-2 opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/90">
          <X className="h-5 w-5 text-black" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="flex flex-col relative w-full border-[10px] rounded-[20px] border-white aspect-video bg- flex items-center justify-center">
          {/* Main image */}
          <div className="relative w-full h-[80vh]">
            <Image
              src={images[index]}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover select-none rounded-[20px] "
              draggable={false}
              quality={90}
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          {/* Nav buttons - only show if there are multiple images */}
          {hasMultipleImages && (
            <>
              <button
                aria-label="Previous image"
                onClick={goPrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                aria-label="Next image"
                onClick={goNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

             {/* Thumbnails - only show if there are multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-0 bg-transparent bg-black/80 px-3 sm:px-4 py-3 flex gap-2 overflow-x-auto">
            {images.map((thumb, i) => (
              <button
                key={thumb + i}
                onClick={() => setIndex(i)}
                className={`relative flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden border ${
                  i === index ? "border-white" : "border-white/20"
                }`}
                aria-label={`Go to image ${i + 1}`}
              >
                <Image
                  src={thumb}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className={` object-cover ${index == i ? 'border-2 border-white ': ''} `}
                  sizes={` ${ index== i ? '100px' : '80px'}  `}
                  quality={60}
                />
              </button>
            ))}
          </div>
        )}
        </div>

      
      </DialogContent>
    </Dialog>
  )
}
