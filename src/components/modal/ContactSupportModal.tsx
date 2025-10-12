import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateContactQuery } from "@/hooks/api/useContactQueries"

interface ContactSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })

  const createQueryMutation = useCreateContactQuery()

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    createQueryMutation.mutate(formData, {
      onSuccess: () => {
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-dark-green">Contact Support</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-dark-green font-semibold">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={createQueryMutation.isPending}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-dark-green font-semibold">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={createQueryMutation.isPending}
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-dark-green font-semibold">
              Phone (Optional)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={createQueryMutation.isPending}
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-dark-green font-semibold">
              Subject *
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="Brief description of your query"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={createQueryMutation.isPending}
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-dark-green font-semibold">
              Message *
            </Label>
            <textarea
              id="message"
              name="message"
              placeholder="Describe your issue or question in detail..."
              value={formData.message}
              onChange={handleChange}
              required
              disabled={createQueryMutation.isPending}
              rows={5}
              className="flex w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 shadow-sm transition-all duration-200 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Status Message */}
          {createQueryMutation.isSuccess && (
            <div className="p-4 bg-green/10 border border-green/20 rounded-2xl">
              <p className="text-green text-sm font-medium">
                Your message has been sent successfully! We'll get back to you soon.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              disabled={createQueryMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-full bg-green text-white font-semibold hover:bg-light-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createQueryMutation.isPending}
            >
              {createQueryMutation.isPending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
