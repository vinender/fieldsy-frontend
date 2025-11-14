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

  // Navigation functions
  const goPrev = () => setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  const goNext = () => setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  // Preload adjacent images when modal opens or index changes
  useEffect(() => {
    if (!open || images.length <= 1) return

    const preloadImage = (src: string) => {
      const img = new window.Image()
      img.src = src
    }

    // Preload previous and next images
    const prevIndex = index === 0 ? images.length - 1 : index - 1
    const nextIndex = index === images.length - 1 ? 0 : index + 1

    preloadImage(images[prevIndex])
    preloadImage(images[nextIndex])

    // Also preload images 2 positions away for smoother navigation
    if (images.length > 3) {
      const prevPrevIndex = prevIndex === 0 ? images.length - 1 : prevIndex - 1
      const nextNextIndex = nextIndex === images.length - 1 ? 0 : nextIndex + 1
      preloadImage(images[prevPrevIndex])
      preloadImage(images[nextNextIndex])
    }
  }, [open, index, images])

  // Keyboard navigation
  useEffect(() => {
    if (!open || images.length <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goPrev()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        goNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, index, images.length, goPrev, goNext])

  if (!images || images.length === 0) return null

  const hasMultipleImages = images.length > 1
  const prevIndex = index === 0 ? images.length - 1 : index - 1
  const nextIndex = index === images.length - 1 ? 0 : index + 1

  return (  
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-5xl p-0 overflow-hidden  border-none rounded-2xl">
        {/* Custom close button with white background in top right */}
        <DialogClose className="absolute -right-0 -top-0  z-50 rounded-full bg-gray-50 p-2 opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/90">
          <X className="h-5 w-5 text-black" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="flex flex-col relative w-full border-[10px] rounded-[20px] border-white aspect-video bg-black flex items-center justify-center">
          {/* Main image */}
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Image
              src={images[index]}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover select-none rounded-[10px]"
              draggable={false}
              quality={90}
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          {/* Hidden preload images for adjacent images - ensures instant navigation */}
          {hasMultipleImages && (
            <>
              <div className="hidden">
                <Image
                  src={images[prevIndex]}
                  alt="Preload previous"
                  width={1200}
                  height={800}
                  priority
                  quality={90}
                />
                <Image
                  src={images[nextIndex]}
                  alt="Preload next"
                  width={1200}
                  height={800}
                  priority
                  quality={90}
                />
              </div>
            </>
          )}

          {/* Nav buttons - only show if there are multiple images */}
          {hasMultipleImages && (
            <>
              <button
                aria-label="Previous image"
                onClick={goPrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/35 hover:bg-white/55 text-white transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                aria-label="Next image"
                onClick={goNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/35 hover:bg-white/55 text-white transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

        {/* Thumbnails - only show if there are multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2  px-3 sm:px-4 py-3 flex gap-2 overflow-x-auto rounded-t-xl">
            {images.map((thumb, i) => (
              <button
                key={thumb + i}
                onClick={() => setIndex(i)}
                className={`relative flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden border-2 ${
                  i === index ? "border-white" : "border-white/20"
                }`}
                aria-label={`Go to image ${i + 1}`}
              >
                <Image
                  src={thumb}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  quality={60}
                  priority={i <= 5} // Prioritize first 6 thumbnails
                  loading={i <= 5 ? "eager" : "lazy"}
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
