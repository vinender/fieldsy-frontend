"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

interface NotificationsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsSidebar({ isOpen: isOpenProp, onClose }: NotificationsSidebarProps) {
  const [isOpen, setIsOpen] = useState(isOpenProp)

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

  // Placeholder notifications
  const notifications: Array<{ id: string; title: string; description: string; time: string; unread?: boolean }> = [
    { id: '1', title: 'Booking Confirmed', description: 'Your booking for Green Meadow is confirmed.', time: '2h ago', unread: true },
    { id: '2', title: 'Payout Sent', description: 'Your weekly payout has been processed.', time: '1d ago' },
    { id: '3', title: 'New Message', description: 'You have a new message from Alex.', time: '2d ago', unread: true },
  ]

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
        className={`fixed right-0 top-0 h-full w-[420px] bg-[#fffcf3] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={closeSidebar}
              className="w-12 h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#192215]" />
            </button>
            <h2 className="text-[29px] font-semibold text-[#192215]">Notifications</h2>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        {/* Content */}
        <div className="px-6 py-6 h-[calc(100%-140px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-600 mt-10">No notifications yet</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border ${n.unread ? 'border-green bg-[#eef7e9]' : 'border-gray-200 bg-white'} p-4`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[#192215] font-semibold mb-1">{n.title}</div>
                      <div className="text-sm text-gray-700">{n.description}</div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap ml-3">{n.time}</div>
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


