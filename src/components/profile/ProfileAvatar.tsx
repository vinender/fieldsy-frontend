"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { getUserInitials } from "@/utils/getUserImage"

const DEFAULT_FALLBACK_SRC = "/user.svg"

// ... (keep interface definitions)

export type ProfileAvatarUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  googleImage?: string | null
  profileImage?: string | null
  avatar?: string | null
  provider?: string | null
}

export interface ProfileAvatarProps {
  user?: ProfileAvatarUser | null
  /**
   * Optional fixed size for the avatar (in px).
   * Leave undefined to control sizing via responsive utility classes.
   */
  size?: number
  className?: string
  imageClassName?: string
  fallbackSrc?: string
  alt?: string
  sizes?: string
}

export function ProfileAvatar({
  user,
  size,
  className,
  imageClassName,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  alt,
  sizes,
}: ProfileAvatarProps) {
  const [primaryErrored, setPrimaryErrored] = useState(false)
  const [fallbackErrored, setFallbackErrored] = useState(false)

  const primarySrc = useMemo(() => {
    if (!user) return null

    const candidates = [
      user.image,
      user.googleImage,
      user.profileImage,
      user.avatar,
    ]

    const validSrc = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0)
    return validSrc || null
  }, [user])

  const usingPrimary = !!primarySrc && !primaryErrored
  const resolvedSrc = usingPrimary ? primarySrc : fallbackSrc

  const altText = alt || user?.name || user?.email || "User avatar"

  return (
    <div
      className={cn(
        "relative flex-shrink-0 rounded-full overflow-hidden bg-[#f2f2ef] text-[#192215] flex items-center justify-center",
        className
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      <Image
        src={resolvedSrc}
        alt={altText}
        fill
        sizes={sizes || (size ? `${size}px` : "56px")}
        className={cn("object-cover", imageClassName)}
        onError={() => {
          if (usingPrimary) {
            setPrimaryErrored(true)
          }
        }}
      />
    </div>
  )
}
