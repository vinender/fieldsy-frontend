"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Bell, Check, CheckCheck } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatDistance } from 'date-fns'
import { getNowUK } from '@/utils/ukTime'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

interface NotificationsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsSidebar({ isOpen: isOpenProp, onClose }: NotificationsSidebarProps) {
  const [isOpen, setIsOpen] = useState(isOpenProp)
  const [isMounted, setIsMounted] = useState(false)
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false)
  const router = useRouter()
  const { data: session } = useSession();
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Get user role from session
  const userRole = (session as any)?.user?.role || 'USER'
  const isFieldOwner = userRole === 'FIELD_OWNER'

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])


  useEffect(() => {
    setIsOpen(isOpenProp)

    // Mark all notifications as read when sidebar opens
    if (isOpenProp && !hasMarkedAsRead && notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        markAllAsRead();
        setHasMarkedAsRead(true);
      }
    }

    // Reset hasMarkedAsRead when sidebar closes
    if (!isOpenProp) {
      setHasMarkedAsRead(false);
    }
  }, [isOpenProp, notifications, hasMarkedAsRead, markAllAsRead]);


  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Store original styles
      const originalBodyStyle = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      };

      const originalHtmlStyle = {
        overflow: document.documentElement.style.overflow,
      };

      // Lock body scroll
      document.body.classList.add('sidebar-open');
      document.body.style.top = `-${scrollY}px`;
      document.documentElement.style.overflow = 'hidden';

      return () => {
        // Restore original styles
        document.body.classList.remove('sidebar-open');
        document.body.style.overflow = originalBodyStyle.overflow;
        document.body.style.position = originalBodyStyle.position;
        document.body.style.top = originalBodyStyle.top;
        document.body.style.width = originalBodyStyle.width;
        document.documentElement.style.overflow = originalHtmlStyle.overflow;

        // Restore scroll position
        window.scrollTo(scrollX, scrollY);
      };
    } else {
      // Cleanup when closing
      document.body.classList.remove('sidebar-open');
      document.documentElement.style.overflow = '';
    }
  }, [isOpen])

  const closeSidebar = () => {
    setIsOpen(false)
    onClose()
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Close the sidebar
    closeSidebar();

    // Navigate based on notification type and data
    const { type, data, title } = notification
    const typeLower = type?.toLowerCase() || ''

    // Debug log to see actual notification type
    console.log('Notification clicked:', { type, typeLower, title, data, isFieldOwner })

    // Helper to get IDs from various data structures
    const getFieldId = () => data?.fieldId || data?.field?.id || data?.booking?.fieldId || data?.booking?.field?.id
    const getBookingId = () => data?.bookingId || data?.booking?.id
    const getReviewId = () => data?.reviewId || data?.review?.id

    // Check notification category by type string
    const isReviewNotification = typeLower.includes('review')
    const isBookingNotification = typeLower.includes('booking')
    const isPaymentNotification = typeLower.includes('payment') || typeLower.includes('payout') || typeLower.includes('earning')
    const isMessageNotification = typeLower.includes('message')

    // Handle review notifications
    if (isReviewNotification) {
      const fieldId = getFieldId()
      const reviewId = getReviewId()

      // "New review received" for field owner
      if (typeLower.includes('received') || typeLower.includes('new_review') || typeLower.includes('new-review')) {
        if (isFieldOwner && fieldId) {
          router.push(`/field-owner/preview?fieldId=${fieldId}#reviews`)
          return
        }
      }

      // "Review posted success" for dog owner
      if (typeLower.includes('posted') || typeLower.includes('success') || typeLower.includes('submitted') || typeLower.includes('created')) {
        if (!isFieldOwner && fieldId) {
          const reviewParam = reviewId ? `?reviewId=${reviewId}` : ''
          router.push(`/fields/${fieldId}${reviewParam}#reviews`)
          return
        }
      }

      // "Leave review" reminder
      if (typeLower.includes('leave') || typeLower.includes('reminder')) {
        const bookingId = getBookingId()
        if (bookingId) {
          router.push(`/user/my-bookings?tab=previous&review=${bookingId}`)
        } else {
          router.push('/user/my-bookings?tab=previous')
        }
        return
      }

      // Fallback for review notifications
      if (fieldId) {
        if (isFieldOwner) {
          router.push(`/field-owner/preview?fieldId=${fieldId}#reviews`)
        } else {
          const reviewParam = reviewId ? `?reviewId=${reviewId}` : ''
          router.push(`/fields/${fieldId}${reviewParam}#reviews`)
        }
      } else {
        router.push(isFieldOwner ? '/' : '/user/my-bookings?tab=previous')
      }
      return
    }

    // Handle booking notifications
    if (isBookingNotification) {
      const bookingId = getBookingId()
      const fieldId = getFieldId()

      if (isFieldOwner) {
        // Field owner: go to home page (BookingHistory) with booking highlighted
        if (bookingId) {
          router.push(`/?bookingId=${bookingId}`)
        } else if (fieldId) {
          router.push(`/?fieldId=${fieldId}`)
        } else {
          router.push('/')
        }
      } else {
        // Dog owner: go to my-bookings with booking highlighted
        if (bookingId) {
          if (typeLower.includes('cancel')) {
            router.push(`/user/my-bookings?status=cancelled&bookingId=${bookingId}`)
          } else {
            router.push(`/user/my-bookings?bookingId=${bookingId}`)
          }
        } else {
          router.push('/user/my-bookings')
        }
      }
      return
    }

    // Handle payment/payout notifications
    if (isPaymentNotification) {
      if (isFieldOwner) {
        router.push('/field-owner/payouts')
      } else {
        const bookingId = getBookingId()
        if (bookingId) {
          router.push(`/user/my-bookings?bookingId=${bookingId}`)
        } else {
          router.push('/user/my-bookings')
        }
      }
      return
    }

    // Handle message notifications
    if (isMessageNotification) {
      if (data?.chatId) {
        router.push(`/user/messages?chat=${data.chatId}`)
      } else if (data?.conversationId) {
        router.push(`/user/messages?chat=${data.conversationId}`)
      } else {
        router.push('/user/messages')
      }
      return
    }

    // Handle specific notification types
    if (typeLower === 'field_approved' || typeLower === 'field-approved') {
      if (isFieldOwner) {
        router.push('/')
      } else {
        const fieldId = getFieldId()
        router.push(fieldId ? `/fields/${fieldId}` : '/fields')
      }
      return
    }

    if (typeLower === 'field_update' || typeLower === 'field-update') {
      const fieldId = getFieldId()
      if (fieldId && isFieldOwner) {
        router.push(`/?edit=true&fieldId=${fieldId}`)
      } else {
        router.push('/')
      }
      return
    }

    // Default navigation based on role and available data
    const defaultBookingId = getBookingId()
    const defaultFieldId = getFieldId()

    if (isFieldOwner) {
      if (defaultBookingId) {
        router.push(`/?bookingId=${defaultBookingId}`)
      } else if (defaultFieldId) {
        router.push(`/?fieldId=${defaultFieldId}`)
      } else {
        router.push('/')
      }
    } else {
      if (defaultBookingId) {
        router.push(`/user/my-bookings?bookingId=${defaultBookingId}`)
      } else {
        router.push('/user/my-bookings')
      }
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_received':
      case 'booking_confirmed':
        return 'border-blue-300 bg-blue-50'
      case 'field_approved':
        return 'border-green-300 bg-green-50'
      case 'payment_received':
        return 'border-yellow-300 bg-yellow-50'
      case 'review_posted':
        return 'border-purple-300 bg-purple-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeSidebar}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:max-w-[540px] bg-light z-50 transform transition-transform duration-300 ease-out overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={closeSidebar}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-cream rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-dark-green" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-[18px] sm:text-[22px] lg:text-[29px] font-semibold text-dark-green truncate">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {isMounted && notifications.length > 0 && (
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 sm:p-2 text-green hover:bg-green/10 rounded-lg transition-colors sm:hidden"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <button
                  onClick={markAllAsRead}
                  className="hidden sm:block p-2 text-green text-[14px] sm:text-[16px] font-[600] underline hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                  title="Clear all"
                >
                  Mark all as read
                </button>
                {/* <button
                  onClick={clearAll}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-5 h-5" />
                </button> */}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200" />

        {/* Content */}
        <div
          className="h-[calc(100%-140px)] overflow-y-auto overflow-x-hidden notification-scrollbar"
          onWheel={(e) => {
            // Prevent scroll from propagating to the body
            e.stopPropagation();
          }}>
          {!isMounted || loading ? (
            <div className="text-center text-gray-600 mt-10">Loading notifications...</div>
          ) : notifications?.length === 0 ? (
            <div className="text-center mt-10">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-2">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="">
              {notifications?.map((notification) => (
                <div
                  key={notification.id}
                  className={` border-b py-2 transition-all cursor-pointer ${!notification.read
                    ? `${getNotificationColor(notification.type)} border-opacity-50`
                    : 'border-gray-200 bg-light-cream hover:bg-cream'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2 p-3 sm:p-4">
                    <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                      {/* <div className="text-2xl">{getNotificationIcon(notification.type)}</div> */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className="text-dark-green font-[600] sm:font-[700] text-[16px] sm:text-[18px] flex-1 break-words">
                            {notification.title}
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-green rounded-full flex-shrink-0 mt-2"></span>
                          )}
                        </div>
                        <div className="text-[13px] sm:text-[14px] text-gray-700 font-[400] mt-1 break-words">
                          {notification.message}
                        </div>
                        <div className="text-[11px] sm:text-xs text-gray-500 mt-2">
                          {formatDistance(new Date(notification.createdAt), getNowUK(), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          className="p-1 text-green hover:bg-green/10 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      {/* <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}