"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Menu, MessageCircle, Bell, X } from "lucide-react"
import NotificationsSidebar from "@/components/sidebar/NotificationsSidebar"
import { ProfileDropdown } from "@/components/profile/ProfileDropdown"
import { LogoutConfirmationModal } from "@/components/modal/LogoutConfirmationModal"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useChat } from "@/contexts/ChatContext"
import { ResponsiveLink } from "@/components/common/ResponsiveLink"
import { OptimizedLink, usePrefetch } from "@/components/common/OptimizedLink"
import router from "next/router"
import { ProfileAvatar } from "@/components/profile/ProfileAvatar"

export function Header() {
  const pathname = usePathname()

  // Use NextAuth session directly for robust authentication state
  const { data: session, status } = useSession()

  // Fallback to AuthContext for additional user data (profile image, etc.)
  const { user: authUser } = useAuth()

  const { unreadCount } = useNotifications()
  const { unreadMessagesCount, unreadConversationsCount } = useChat()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if we're on the landing page
  const isLandingPage = pathname === "/"

  // Prevent hydration errors by only rendering auth-dependent content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30
      setScrolled(isScrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ROBUST authentication state using NextAuth session
  // This ensures auth state persists on hard refresh and is always accurate
  const isAuthenticated = status === 'authenticated' && !!session?.user
  const isLoading = status === 'loading'

  // Use authUser from AuthContext if available (has more profile details), otherwise fallback to session user
  const currentUser = authUser || (session?.user as any)

  // Navigation items based on authentication and role
  const navigation = useMemo(() => {
    // Base navigation for non-authenticated users (now includes Search Fields)
    const baseNav = [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Search Fields", href: "/fields" },
      { name: "How it works", href: "/how-it-works" },
      { name: "FAQs", href: "/faqs" },
    ]

    // During SSR or before mount, always return base navigation to prevent hydration mismatch
    if (!mounted) {
      return baseNav
    }

    // If not authenticated, show base navigation with Search Fields
    if (!isAuthenticated || !currentUser) {
      return baseNav
    }

    // For FIELD_OWNER role
    if (currentUser.role === 'FIELD_OWNER') {
      return [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "FAQs", href: "/faqs" },
      ]
    }

    // For DOG_OWNER role (default authenticated user)
    return [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Search Fields", href: "/fields" },
      { name: "How it works", href: "/how-it-works" },
      { name: "FAQs", href: "/faqs" },
    ]
  }, [currentUser, isAuthenticated, mounted])

  // Dynamic user navigation based on role (only when authenticated)
  const userNavigation = useMemo(() => {
    if (!isAuthenticated || !currentUser) {
      return []
    }
    
    if (currentUser.role === 'FIELD_OWNER') {
      return [
        { name: "Dashboard", href: "/" },
        { name: "My Fields", href: "/field-owner/my-fields" },
        { name: "Bookings", href: "/field-owner/preview" },
        { name: "Messages", href: "/user/messages" },
        { name: "Profile", href: "/user/profile" },
      ]
    }
    
    // DOG_OWNER navigation
    return [
      { name: "My Bookings", href: "/user/my-bookings" },
      { name: "Saved Fields", href: "/user/saved-fields" },
      { name: "Messages", href: "/user/messages" },
      { name: "Profile", href: "/user/profile" },
    ]
  }, [currentUser, isAuthenticated])

  // Check if field owner is viewing homepage (which shows their dashboard)
  // Only check after mount to prevent hydration mismatch
  const isFieldOwnerHomepage = mounted && isLandingPage && currentUser?.role === 'FIELD_OWNER'

  // Determine header styles based on page, user role, and scroll position
  // For field owners on homepage, always use white background
  const headerBg = !isLandingPage || scrolled || isFieldOwnerHomepage ? "bg-white shadow-sm" : "bg-transparent"
  const textColor = !isLandingPage || scrolled || isFieldOwnerHomepage ? "text-gray-700" : "text-white"
  const navLinkColor = !isLandingPage || scrolled || isFieldOwnerHomepage
    ? "text-gray-600 hover:text-gray-900"
    : "text-white/90 hover:text-white"

  return (
    <header className={cn(
      "fixed py-3 sm:py-4 xl:py-[24px] top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 xl:px-20 transition-all duration-300",
      headerBg
    )}>
      <nav className="mx-auto w-full">
        <div className="flex h-12 sm:h-14 xl:h-16 justify-between items-center">
          <div className="flex items-center">
            <ResponsiveLink href="/">
              <Image 
                alt='logo' 
                width={500} 
                height={500} 
                src={`${!isLandingPage || scrolled || isFieldOwnerHomepage ? '/logo/logo.svg' : '/logo/logo.svg'}`} 
                className='object-contain w-[120px] sm:w-[140px] xl:w-[163px] h-[48px] sm:h-[56px] xl:h-[64px]' 
              />
            </ResponsiveLink>
          </div>

          <div className="hidden   sm:flex space-x-4 md:space-x-8 ">
            {navigation.map((item) => (
              <OptimizedLink
                key={item.name}
                href={item.href}
                prefetchStrategy={
                  item.href === "/fields" || item.href === "/" 
                    ? "immediate" 
                    : "viewport"
                }
                priority={item.href === "/fields"}
                className={cn(
                  " text-[12px] md:text-[15px] font-[600] transition-colors",
                  pathname === item.href
                    ? !isLandingPage || scrolled || isFieldOwnerHomepage
                      ? "text-gray-900" 
                      : "text-white"
                    : navLinkColor
                )}
              >
                {item.name}
              </OptimizedLink>
            ))}
          </div>  
          
          {/* Right side items */}
          <div className="hidden xl:flex xl:items-center xl:space-x-4">
            {!mounted ? (
              // Show skeleton/placeholder during SSR to prevent hydration mismatch
              <>
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              </>
            ) : isAuthenticated ? (
              <>
                {/* Message Icon with Badge */}
                <button onClick={() => router.push('/user/messages')}
                  className={cn(
                    "p-2 rounded-full bg-cream transition-colors relative",
                    !isLandingPage || scrolled || isFieldOwnerHomepage
                      ? "hover:bg-gray-100" 
                      : "hover:bg-cream"
                  )}
                  aria-label="Messages"
                 >
                  <Image src='/header/msg.svg' alt="Messages" width={24} height={24} className={cn("h-6 w-6", textColor)} />
                  {unreadConversationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-500 rounded-full shadow-md">
                      <span className="text-[11px] text-white font-bold">
                        {unreadConversationsCount > 99 ? '99+' : unreadConversationsCount}
                      </span>
                    </span>
                  )}
                </button>
                
                {/* Notification Icon with Badge */}
                <button 
                  className={cn(
                    "p-2 rounded-full bg-cream transition-colors relative",
                    !isLandingPage || scrolled || isFieldOwnerHomepage
                      ? "hover:bg-gray-100" 
                      : "hover:bg-white/10"
                  )}
                  aria-label="Notifications"
                  onClick={() => setNotificationsOpen(true)}
                >
                  <Image src='/header/bell.svg' alt="Notifications" width={24} height={24} className={cn("h-6 w-6", textColor)} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blood-red rounded-full shadow-md">
                      <span className="text-[11px] text-white font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </span>
                  )}
                </button>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    data-profile-button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center rounded-full focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-green-500"
                    aria-label="User menu"
                  >
                    <ProfileAvatar
                      user={currentUser}
                      className="h-10 w-10 ring-2 ring-white"
                      alt={currentUser?.name || "Profile"}
                      sizes="40px"
                    />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <ProfileDropdown
                    user={{ 
                      name: currentUser?.name || "User", 
                      email: currentUser?.email || "", 
                      image: currentUser?.image || null,
                      googleImage: currentUser?.googleImage || null,
                      profileImage: currentUser?.profileImage || null,
                      avatar: currentUser?.avatar || null,
                      role: currentUser?.role || null,
                      provider: currentUser?.provider || null,
                    }}
                    isOpen={profileDropdownOpen}
                    onClose={() => setProfileDropdownOpen(false)}
                    onLogout={() => {
                      // Clear all localStorage items
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('currentUser');
                      localStorage.removeItem('pendingUserRole');
                      sessionStorage.clear();
                      
                      // Sign out and redirect to home page
                      signOut({ 
                        callbackUrl: "/",
                        redirect: true 
                      });
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <ResponsiveLink href="/login">
                  <button 
                    className="inline-flex items-center justify-center px-4 sm:px-6 xl:px-[28px] py-2 sm:py-3 xl:py-[16px] text-sm sm:text-base font-medium rounded-full transition-colors bg-light-green text-white hover:bg-green"
                  >
                    Login
                  </button>
                </ResponsiveLink>
                <ResponsiveLink href="/sign-up">
                  <button
                    className="inline-flex items-center justify-center px-4 sm:px-6 xl:px-[28px] py-2 sm:py-3 xl:py-[16px] text-sm sm:text-base text-white font-medium rounded-full transition-colors bg-dark-green hover:bg-green"
                  >
                    Sign Up
                  </button>
                </ResponsiveLink>
              </>
            )}
          </div>
          
          {/* Mobile and tablet menu items */}
          <div className="flex items-center gap-2 xl:hidden">
            {!mounted ? (
              // Show skeleton/placeholder during SSR to prevent hydration mismatch
              <>
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
              </>
            ) : isAuthenticated ? (
              <>
                {/* Message Icon - visible on sm and up */}
                <button 
                  onClick={() => router.push('/user/messages')}
                  className={cn(
                    "flex p-2 rounded-full bg-cream transition-colors relative",
                    !isLandingPage || scrolled || isFieldOwnerHomepage
                      ? "hover:bg-gray-100" 
                      : "hover:bg-cream"
                  )}
                  aria-label="Messages"
                >
                  <Image src='/header/msg.svg' alt="Messages" width={20} height={20} className={cn("h-5 w-5", textColor)} />
                  {unreadConversationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4 px-1 bg-blue-500 rounded-full shadow-md">
                      <span className="text-[10px] text-white font-bold">
                        {unreadConversationsCount > 99 ? '99+' : unreadConversationsCount}
                      </span>
                    </span>
                  )}
                </button>
                
                {/* Notification Icon - visible on sm and up */}
                <button 
                  className={cn(
                    "flex p-2 rounded-full bg-cream transition-colors relative",
                    !isLandingPage || scrolled || isFieldOwnerHomepage
                      ? "hover:bg-gray-100" 
                      : "hover:bg-white/10"
                  )}
                  aria-label="Notifications"
                  onClick={() => setNotificationsOpen(true)}
                >
                  <Image src='/header/bell.svg' alt="Notifications" width={20} height={20} className={cn("h-5 w-5", textColor)} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4 px-1 bg-blood-red rounded-full shadow-md">
                      <span className="text-[10px] text-white font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </span>
                  )}
                </button>
                
                {/* Profile Icon as Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center rounded-full focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-green-500"
                  aria-label="User menu"
                >
                  <ProfileAvatar
                    user={currentUser}
                    className="h-9 w-9 ring-2 ring-white"
                    alt={currentUser?.name || "Profile"}
                    sizes="36px"
                  />
                </button>
              </>
            ) : (
              <>
                {/* Mobile Login/Signup buttons - visible when not authenticated */}
                <ResponsiveLink href="/login">
                  <button 
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors bg-light-green text-white hover:bg-dark-green"
                  >
                    Login
                  </button>
                </ResponsiveLink>
                <ResponsiveLink href="/sign-up">
                  <button
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs text-white font-medium rounded-full transition-colors bg-dark-green hover:bg-light-green"
                  >
                    Sign Up
                  </button>
                </ResponsiveLink>
                {/* Burger menu for non-authenticated users */}
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md p-2 transition-colors",
                    !isLandingPage || scrolled || isFieldOwnerHomepage
                      ? "text-gray-900 hover:bg-gray-100 hover:text-gray-700" 
                      : "text-white hover:bg-white/10"
                  )}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={cn(
        "xl:hidden fixed inset-0 z-50 flex justify-end transition-opacity duration-300",
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "fixed inset-0 bg-black transition-opacity duration-300",
            mobileMenuOpen ? "bg-opacity-50" : "bg-opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={cn(
          "relative flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out shadow-xl",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <Image 
                alt='logo' 
                width={120} 
                height={48} 
                src='/logo/logo.svg'
                className='object-contain' 
              />
              <button
                className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pb-4 overflow-y-auto">
              {/* Show Messages and Notifications on mobile only (below sm screens) */}
              {mounted && isAuthenticated && (
                <div className="sm:hidden px-4 py-3 border-b border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/user/messages');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cream rounded-lg hover:bg-gray-100 transition-colors relative"
                    >
                      <MessageCircle className="h-5 w-5 text-gray-700" />
                      <span className="text-sm font-medium">Messages</span>
                      {unreadConversationsCount > 0 && (
                        <span className="flex items-center justify-center min-w-[18px] h-4 px-1 bg-blue-500 rounded-full">
                          <span className="text-[10px] text-white font-bold">
                            {unreadConversationsCount}
                          </span>
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setNotificationsOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cream rounded-lg hover:bg-gray-100 transition-colors relative"
                    >
                      <Bell className="h-5 w-5 text-gray-700" />
                      <span className="text-sm font-medium">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center min-w-[18px] h-4 px-1 bg-blood-red rounded-full">
                          <span className="text-[10px] text-white font-bold">
                            {unreadCount}
                          </span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation - Show different nav items based on auth state */}
              <nav className="mt-4 px-2 space-y-1">
                <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Navigation
                </div>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-green-100 text-green"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Show user-specific navigation items if authenticated */}
                {mounted && isAuthenticated && userNavigation && (
                  <>
                    <div className="px-2 py-2 mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      My Account
                    </div>
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          pathname === item.href
                            ? "bg-green-100 text-green"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </div>

            <div className="flex-shrink-0 border-t border-gray-200">
              {mounted && isAuthenticated ? (
                <div className="space-y-1">
                  {/* User profile section */}
                  <div className="flex items-center p-4">
                    <ProfileAvatar
                      user={currentUser}
                      className="h-10 w-10"
                      alt={currentUser?.name || "Profile"}
                      sizes="40px"
                    />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {currentUser?.name || "User"}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {currentUser?.email}
                      </div>
                      {currentUser?.role && (
                        <div className="text-xs font-medium text-green">
                          {currentUser.role.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Icons */}
                  <div className="flex items-center justify-around px-4 py-2 border-t border-gray-200">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 relative"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/user/messages');
                      }}
                    >
                      <MessageCircle className="h-5 w-5 text-gray-600" />
                      {unreadConversationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-500 rounded-full shadow-md">
                          <span className="text-[11px] text-white font-bold">
                            {unreadConversationsCount > 99 ? '99+' : unreadConversationsCount}
                          </span>
                        </span>
                      )}
                    </button>
                    <button 
                      className="p-2 rounded-full hover:bg-gray-100 relative"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setNotificationsOpen(true);
                      }}
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-600 rounded-full shadow-md">
                          <span className="text-[11px] text-white font-bold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {/* Sign Out Button */}
                  <div className="px-2 pb-3 border-t border-gray-200 pt-3">
                    <button
                      className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      onClick={() => {
                        setShowLogoutModal(true)
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 text-center mb-4">Please login or sign up to continue</p>
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-2 bg-light-green text-white rounded-full text-sm font-medium hover:bg-dark-green transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/sign-up"
                      className="block w-full text-center px-4 py-2 bg-dark-green text-white rounded-full text-sm font-medium hover:bg-light-green transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
      <NotificationsSidebar isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      
      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false)
          setMobileMenuOpen(false)
          // Clear localStorage items
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('pendingUserRole');
          sessionStorage.clear();
          // Sign out
          signOut({ callbackUrl: "/" })
        }}
      />
    </header>
  )
}
