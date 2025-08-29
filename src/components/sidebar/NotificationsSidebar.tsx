"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

interface NotificationsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsSidebar({ isOpen: isOpenProp, onClose }: NotificationsSidebarProps) {
  const [isOpen, setIsOpen] = useState(isOpenProp)
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll 
  } = useNotifications();
console.log('notification',notifications)
  useEffect(() => {
    setIsOpen(isOpenProp)
  }, [isOpenProp])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
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
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full max-w-[540px] bg-light z-50 transform transition-transform duration-300 ease-out ${
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
        <div className="h-[calc(100%-140px)] overflow-y-auto">
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
                  className={` border-b py-2 transition-all ${
                    !notification.read 
                      ? `${getNotificationColor(notification.type)} border-opacity-50` 
                      : 'border-gray-200 bg-light-cream hover:bg-cream'
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
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