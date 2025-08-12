"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
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
}

export function ProfileDropdown({ user, onLogout, className }: ProfileDropdownProps) {
  const menuItems: { icon: any; label: string; href: string }[] = [
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Calendar, label: "Booking History", href: "/bookings" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Heart, label: "Saved Fields", href: "/favorites" },
    { icon: CreditCard, label: "Saved Cards", href: "/wallet" },
  ]

  const displayInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        "absolute top-full mt-2 right-0 w-[320px] max-w-[90vw] bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden z-50 hidden group-hover:block",
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
          onClick={onLogout}
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


