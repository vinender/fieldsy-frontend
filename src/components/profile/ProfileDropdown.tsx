"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import {
  User,
  Calendar,
  MessageSquare,
  Heart,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react"

type ProfileDropdownProps = {
  user?: { name?: string | null; email?: string | null; image?: string | null }
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

  const menuItems: { icon: any; label: string; href: string }[] = [
    { icon: User, label: "My Profile", href: "/user/profile" },
    { icon: Calendar, label: "My Bookings", href: "/user/my-bookings" },
    { icon: MessageSquare, label: "Messages", href: "/user/messages" },
    { icon: Heart, label: "Saved Fields", href: "/user/saved-fields" },
    { icon: CreditCard, label: "Saved Cards", href: "/user/saved-cards" },
  ]

  const displayInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase()

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
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name || "Profile"} className="w-full h-full object-cover" />
            ) : (
              <span>{displayInitial}</span>
            )}
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
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
                <Icon className="w-5 h-5 text-[#192215]" strokeWidth={2.5} />
              </div>
              <span className="flex-1 text-left text-base font-medium text-[#192215]">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Link>
          )
        })}

        {/* Logout Button */}
        <button
          onClick={() => {
            onLogout?.()
            onClose()
          }}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 transition-colors group"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
            <LogOut className="w-5 h-5 text-[#e31c20]" strokeWidth={2.5} />
          </div>
          <span className="flex-1 text-left text-base font-medium text-[#e31c20]">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default ProfileDropdown


