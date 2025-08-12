"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="max-w-[95vw] sm:max-w-5xl p-0 overflow-hidden bg-black/90 border-none rounded-2xl">
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {/* Main image */}
          <img
            src={images[index]}
            alt={`Image ${index + 1}`}
            className="max-h-[80vh] w-auto object-contain select-none"
            draggable={false}
          />

          {/* Nav buttons */}
          <button
            aria-label="Previous image"
            onClick={goPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/15 hover:bg-white/25 text-white"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            aria-label="Next image"
            onClick={goNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/15 hover:bg-white/25 text-white"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="w-full bg-black/80 px-3 sm:px-4 py-3 flex gap-2 overflow-x-auto">
          {images.map((thumb, i) => (
            <button
              key={thumb + i}
              onClick={() => setIndex(i)}
              className={`relative flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden border ${
                i === index ? "border-white" : "border-white/20"
              }`}
              aria-label={`Go to image ${i + 1}`}
            >
              <img src={thumb} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}


