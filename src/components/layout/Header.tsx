"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Menu, MessageCircle, Bell, User } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // SIMULATED LOGIN STATE - Remove this when using real auth
  const [isSimulatedLoggedIn, setIsSimulatedLoggedIn] = useState(false)
  const simulatedUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    image: null, // Set to null to show default avatar, or provide an image URL
    role: "USER" // or "FIELD_OWNER"
  }
  
  // Check if we're on the landing page
  const isLandingPage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30
      setScrolled(isScrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Search Fields", href: "/fields" },
    { name: "How it works", href: "/how-it-works" },
    { name: "FAQ's", href: "/faqs" },
  ]

  const userNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Bookings", href: "/bookings" },
    { name: "Profile", href: "/profile" },
  ]

  // Determine header styles based on page and scroll position
  const headerBg = !isLandingPage || scrolled ? "bg-white shadow-sm" : "bg-transparent"
  const textColor = !isLandingPage || scrolled ? "text-gray-700" : "text-white"
  const logoColor = !isLandingPage || scrolled ? "text-gray-900" : "text-white"
  const navLinkColor = !isLandingPage || scrolled 
    ? "text-gray-600 hover:text-gray-900" 
    : "text-white/90 hover:text-white"

  // Use simulated login state if auth is not connected
  const isAuthenticated = status === "authenticated" || isSimulatedLoggedIn
  const currentUser = session?.user || (isSimulatedLoggedIn ? simulatedUser : null)

  return (
    <header className={cn(
      "fixed py-3 sm:py-4 xl:py-[24px] top-0 left-0 right-0 z-40 px-4 sm:px-6 xl:px-20 transition-all duration-300",
      headerBg
    )}>
      <nav className="mx-auto w-full">
        <div className="flex h-12 sm:h-14 xl:h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image 
                alt='logo' 
                width={500} 
                height={500} 
                src={`${!isLandingPage || scrolled ? '/logo/logo-green.png' : '/logo/logo.png'}`} 
                className='object-contain w-[120px] sm:w-[140px] xl:w-[163px] h-[48px] sm:h-[56px] xl:h-[64px]' 
              />
            </Link>
          </div>

          <div className="hidden xl:ml-16 xl:flex xl:space-x-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-base font-medium transition-colors",
                  pathname === item.href
                    ? !isLandingPage || scrolled 
                      ? "text-gray-900" 
                      : "text-white"
                    : navLinkColor
                )}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && currentUser?.role === "FIELD_OWNER" && (
              <Link
                href="/fields/manage"
                className={cn(
                  "text-base font-medium transition-colors",
                  pathname === "/fields/manage"
                    ? !isLandingPage || scrolled 
                      ? "text-green-600" 
                      : "text-white"
                    : navLinkColor
                )}
              >
                Manage Fields
              </Link>
            )}
          </div>
          
          {/* Right side items */}
          <div className="hidden xl:flex xl:items-center xl:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Message Icon */}
                <button 
                  className={cn(
                    "p-2 rounded-full transition-colors relative",
                    !isLandingPage || scrolled 
                      ? "hover:bg-gray-100" 
                      : "hover:bg-white/10"
                  )}
                  aria-label="Messages"
                >
                  <MessageCircle className={cn("h-5 w-5", textColor)} />
                </button>
                
                {/* Notification Icon with Badge */}
                <button 
                  className={cn(
                    "p-2 rounded-full transition-colors relative",
                    !isLandingPage || scrolled 
                      ? "hover:bg-gray-100" 
                      : "hover:bg-white/10"
                  )}
                  aria-label="Notifications"
                >
                  <Bell className={cn("h-5 w-5", textColor)} />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* Profile Dropdown */}
                <div className="relative group">
                  <button 
                    className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    aria-label="User menu"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden ring-2 ring-white">
                      {currentUser?.image ? (
                        <img 
                          src={currentUser.image} 
                          alt={currentUser.name || "Profile"} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                          <span className="text-white font-semibold text-lg">
                            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 divide-y divide-gray-100">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                    <div className="py-1">
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          if (isSimulatedLoggedIn) {
                            setIsSimulatedLoggedIn(false)
                          } else {
                            signOut({ callbackUrl: "/" })
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button 
                    className="inline-flex items-center justify-center px-4 sm:px-6 xl:px-[28px] py-2 sm:py-3 xl:py-[16px] text-sm sm:text-base font-medium rounded-full transition-colors bg-light-green text-white hover:bg-green"
                  >
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button 
                    className="inline-flex items-center justify-center px-4 sm:px-6 xl:px-[28px] py-2 sm:py-3 xl:py-[16px] text-sm sm:text-base text-white font-medium rounded-full transition-colors bg-dark-green hover:bg-green"
                  >
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-2 xl:hidden">
            {/* Mobile Login/Signup buttons - visible when not authenticated */}
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <button 
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors bg-light-green text-white hover:bg-dark-green"
                  >
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button 
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs text-white font-medium rounded-full transition-colors bg-dark-green hover:bg-light-green"
                  >
                    Sign Up
                  </button>
                </Link>
              </>
            )}
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-md p-2 transition-colors",
                !isLandingPage || scrolled 
                  ? "text-gray-400 hover:bg-gray-100 hover:text-gray-500" 
                  : "text-white hover:bg-white/10"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white mt-2 mx-4 sm:mx-6 rounded-lg shadow-lg">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                  pathname === item.href
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && currentUser?.role === "FIELD_OWNER" && (
              <Link
                href="/fields/manage"
                className={cn(
                  "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                  pathname === "/fields/manage"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage Fields
              </Link>
            )}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-4 pb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                      {currentUser?.image ? (
                        <img 
                          src={currentUser.image} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                          <span className="text-white font-semibold">
                            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {currentUser?.name || "User"}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {currentUser?.email}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Mobile Icons */}
                <div className="flex items-center justify-around px-4 py-2 border-b border-gray-200">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <MessageCircle className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    if (isSimulatedLoggedIn) {
                      setIsSimulatedLoggedIn(false)
                    } else {
                      signOut({ callbackUrl: "/" })
                    }
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm text-gray-500 text-center">Please login or sign up to continue</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 text-center px-4 py-2 bg-light-green text-white rounded-full text-sm font-medium hover:bg-dark-green transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center px-4 py-2 bg-dark-green text-white rounded-full text-sm font-medium hover:bg-light-green transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}