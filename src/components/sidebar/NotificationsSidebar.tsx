"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

interface NotificationsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsSidebar({ isOpen: isOpenProp, onClose }: NotificationsSidebarProps) {
  const [isOpen, setIsOpen] = useState(isOpenProp)
  const router = useRouter()
  const { data: session } = useSession()
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll 
  } = useNotifications();

console.log('notification',notifications);
  
  // Get user role from session
  const userRole = (session as any)?.user?.role || 'user'
  const isFieldOwner = userRole === 'field_owner'


  useEffect(() => {
    setIsOpen(isOpenProp)
  }, [isOpenProp]);


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

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
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
    
    // Debug log to see actual notification type
    console.log('Notification clicked:', { type, title, data, isFieldOwner })

    // Check if it's a review success notification by title as well
    const isReviewSuccess = type?.toLowerCase().includes('review') && 
                           (title?.toLowerCase().includes('posted') || 
                            title?.toLowerCase().includes('success') ||
                            title?.toLowerCase().includes('submitted'))

    if (isReviewSuccess && !isFieldOwner) {
      // Handle review posted successfully for dog owners
      const fieldId = data?.fieldId || data?.field?.id || data?.booking?.fieldId || data?.booking?.field?.id
      
      if (fieldId) {
        console.log('Review success - Redirecting to field:', fieldId)
        router.push(`/fields/${fieldId}#reviews`)
        return
      }
    }

    switch (type) {
      case 'booking_confirmation':
      case 'booking_confirmed':
      case 'BOOKING_CONFIRMATION':
        // Dog owner: go to their bookings
        // Field owner: go to dashboard bookings
        if (isFieldOwner) {
          router.push('/field-owner/bookings')
        } else {
          router.push('/user/my-bookings')
        }
        break

      case 'new_review':
      case 'review_received':
      case 'REVIEW_RECEIVED':
        // Field owner receives a new review
        if (isFieldOwner) {
          if (data?.fieldId) {
            router.push(`/field-owner/reviews?field=${data.fieldId}`)
          } else {
            router.push('/field-owner/reviews')
          }
        } else {
          // Shouldn't happen for dog owners, but fallback
          router.push('/user/my-bookings?tab=previous')
        }
        break

      case 'review_posted':
      case 'REVIEW_POSTED':
      case 'review_posted_successfully':
      case 'REVIEW_POSTED_SUCCESSFULLY':
      case 'review_success':
      case 'REVIEW_SUCCESS':
      case 'review_submitted':
      case 'REVIEW_SUBMITTED':
      case 'review_created':
      case 'REVIEW_CREATED':
        // Dog owner posted a review successfully - show them their review on the field page
        console.log('Review notification data:', data);
        
        if (!isFieldOwner) {
          // Try multiple ways to get the fieldId
          const fieldId = data?.fieldId || data?.field?.id || data?.booking?.fieldId || data?.booking?.field?.id
          
          if (fieldId) {
            console.log('Redirecting to field:', fieldId)
            router.push(`/fields/${fieldId}#reviews`)
          } else if (data?.bookingId) {
            // If we only have bookingId, still try to navigate to field if possible
            console.log('Only bookingId available:', data.bookingId)
            router.push('/user/my-bookings?tab=previous')
          } else {
            console.log('No field or booking data available')
            router.push('/user/my-bookings?tab=previous')
          }
        } else {
          // Field owners shouldn't get this, but fallback
          router.push('/field-owner/reviews')
        }
        break

      case 'leave_review':
      case 'LEAVE_REVIEW':
      case 'review_reminder':
        // Only for dog owners - redirect to leave a review
        if (data?.bookingId) {
          router.push(`/user/my-bookings?tab=previous&review=${data.bookingId}`)
        } else {
          router.push('/user/my-bookings?tab=previous')
        }
        break

      case 'new_booking':
      case 'NEW_BOOKING':
      case 'new_booking_received':
        // For field owners - redirect to bookings/dashboard
        if (isFieldOwner) {
          router.push('/field-owner/bookings')
        } else {
          // Dog owners might get this if they have a booking update
          router.push('/user/my-bookings')
        }
        break

      case 'booking_cancelled':
      case 'BOOKING_CANCELLED':
        // Both roles go to their respective bookings with cancelled filter
        if (isFieldOwner) {
          router.push('/field-owner/bookings?status=cancelled')
        } else {
          router.push('/user/my-bookings?status=cancelled')
        }
        break

      case 'payment_received':
      case 'PAYMENT_RECEIVED':
        // Field owners go to payouts, dog owners to payment history
        if (isFieldOwner) {
          router.push('/field-owner/payouts')
        } else {
          router.push('/user/payment-history')
        }
        break

      case 'field_approved':
      case 'FIELD_APPROVED':
        // Field owner specific - go to their field or dashboard
        if (data?.fieldId) {
          if (isFieldOwner) {
            router.push('/field-owner/dashboard')
          } else {
            router.push(`/fields/${data.fieldId}`)
          }
        } else {
          if (isFieldOwner) {
            router.push('/field-owner/dashboard')
          } else {
            router.push('/fields')
          }
        }
        break

      case 'new_message':
      case 'NEW_MESSAGE':
      case 'message_received':
        // Both roles can receive messages
        if (data?.chatId) {
          if (isFieldOwner) {
            router.push(`/field-owner/messages?chat=${data.chatId}`)
          } else {
            router.push(`/user/messages?chat=${data.chatId}`)
          }
        } else {
          if (isFieldOwner) {
            router.push('/field-owner/messages')
          } else {
            router.push('/user/messages')
          }
        }
        break

      case 'payout_processed':
      case 'PAYOUT_PROCESSED':
        // Field owner specific
        router.push('/field-owner/payouts')
        break

      case 'field_update':
      case 'FIELD_UPDATE':
        // Field owner specific
        if (data?.fieldId) {
          router.push(`/field-owner/edit-field/${data.fieldId}`)
        } else {
          router.push('/field-owner/dashboard')
        }
        break

      default:
        // Default to appropriate dashboard based on role
        if (isFieldOwner) {
          router.push('/field-owner/dashboard')
        } else {
          router.push('/user/my-bookings')
        }
        break
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_received':
        return '📅'
      case 'booking_confirmed':
        return '✅'
      case 'field_approved':
        return '🎉'
      case 'payment_received':
        return '💰'
      case 'review_posted':
        return '⭐'
      default:
        return '🔔'
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
        className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-[540px] bg-light z-50 transform transition-transform duration-300 ease-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={closeSidebar}
                className="w-12 h-12 bg-cream rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-dark-green" />
              </button>
              <div>
                <h2 className="text-[29px] font-semibold text-dark-green">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 text-green hover:bg-green/10 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-5 h-5" />
                  </button>
                )}
                <button
                onClick={markAllAsRead}
                className="p-2 text-green text-[16px] font-[600] underline hover:bg-red-50 rounded-lg transition-colors"
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
          {loading ? (
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
                  className={` border-b py-2 transition-all cursor-pointer ${
                    !notification.read 
                      ? `${getNotificationColor(notification.type)} border-opacity-50` 
                      : 'border-gray-200 bg-light-cream hover:bg-cream'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                > 
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1 p-4">
                      {/* <div className="text-2xl">{getNotificationIcon(notification.type)}</div> */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-dark-green font-[700] text-[18px]">
                            {notification.title}
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-green rounded-full"></span>
                          )}
                        </div>
                        <div className="text-[14px] text-gray-700 font-[400] mt-1">
                          {notification.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          className="p-1 text-green hover:bg-green/10 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
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