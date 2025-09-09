"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import {
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import { getUserImage, getUserInitials } from "@/utils/getUserImage"

type ProfileDropdownProps = {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null }
  onLogout?: () => void
  className?: string
  isOpen: boolean
  onClose: () => void
}

export function ProfileDropdown({ user, onLogout, className, isOpen, onClose }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if the click is not on the profile button itself
        const profileButton = document.querySelector('[data-profile-button]')
        if (profileButton && !profileButton.contains(event.target as Node)) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Determine menu items based on user role
  const menuItems: { icon: string; label: string; href: string }[] = user?.role === 'FIELD_OWNER' 
    ? [
        { icon: '/profile/profile.svg', label: "My Profile", href: "/user/profile" },
        { icon: '/profile/booking.svg', label: "Booking History", href: "/" },
        { icon: '/profile/payout.svg', label: "Payout History", href: "/field-owner/payouts" },
        { icon: '/profile/messages.svg', label: "Messages", href: "/user/messages" },
        { icon: '/profile/field.svg', label: "My Field", href: "/field-owner/preview" },
      ]
    : [
        { icon: '/profile/profile.svg', label: "My Profile", href: "/user/profile" },
        { icon: '/profile/booking.svg', label: "My Bookings", href: "/user/my-bookings" },
        { icon: '/profile/messages.svg', label: "Messages", href: "/user/messages" },
        { icon: '/profile/heart.svg', label: "Saved Fields", href: "/user/saved-fields" },
        { icon: '/profile/saved-cards.svg', label: "Saved Cards", href: "/user/saved-cards" },
      ]

  const displayInitial = getUserInitials(user)

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute top-full mt-2 right-0 w-[320px] max-w-[90vw] bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden z-50",
        className
      )}
    >
      {/* User Profile Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-xl font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getUserImage(user)} 
              alt={user?.name || "Profile"} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${displayInitial}&background=3A6B22&color=fff&size=200`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-[#192215] truncate">{user?.name || "User"}</h3>
            <p className="text-sm text-[#8d8d8d] truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mx-6" />

      {/* Menu Items */}
      <div className="p-6 pt-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
              <Image 
                src={item.icon} 
                alt={item.label} 
                width={20} 
                height={20}
                className="w-5 h-5"
              />
            </div>
            <span className="flex-1 text-left text-base font-medium text-[#192215]">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={() => {
            onLogout?.()
            onClose()
          }}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 transition-colors group"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
            <Image 
              src="/profile/logout.svg" 
              alt="Logout" 
              width={20} 
              height={20}
              className="w-5 h-5"
            />
          </div>
          <span className="flex-1 text-left text-base font-medium text-blood-red">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default ProfileDropdown


