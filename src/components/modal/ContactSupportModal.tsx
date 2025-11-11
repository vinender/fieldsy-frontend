import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateContactQuery } from "@/hooks/api/useContactQueries"
import { toast } from "sonner"

interface ContactSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ValidationErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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
      setErrors({})
      setTouched({})
    }
  }, [isOpen])

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        return undefined

      case "email":
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return undefined

      case "subject":
        if (!value.trim()) return "Subject is required"
        if (value.trim().length < 5) return "Subject must be at least 5 characters"
        return undefined

      case "message":
        if (!value.trim()) return "Message is required"
        if (value.trim().length < 10) return "Message must be at least 10 characters"
        return undefined

      default:
        return undefined
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    newErrors.name = validateField("name", formData.name)
    newErrors.email = validateField("email", formData.email)
    newErrors.subject = validateField("subject", formData.subject)
    newErrors.message = validateField("message", formData.message)

    setErrors(newErrors)

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== undefined)

    if (hasErrors) {
      toast.error("Please fill in all required fields correctly")
    }

    return !hasErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true
    })

    // Validate form
    if (!validateForm()) {
      return
    }

    createQueryMutation.mutate(formData, {
      onSuccess: () => {
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Validate field on blur
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
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
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={createQueryMutation.isPending}
              className={touched.name && errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-dark-green font-semibold">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={createQueryMutation.isPending}
              className={touched.email && errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-dark-green font-semibold">
              Phone <span className="text-gray-400 text-sm">(Optional)</span>
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
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="Brief description of your query"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={createQueryMutation.isPending}
              className={touched.subject && errors.subject ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            />
            {touched.subject && errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-dark-green font-semibold">
              Message <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="message"
              name="message"
              placeholder="Describe your issue or question in detail..."
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={createQueryMutation.isPending}
              rows={5}
              className={`flex w-full rounded-2xl border bg-white px-4 py-3 text-base text-gray-800 shadow-sm transition-all duration-200 focus:outline-none focus:ring-1 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                touched.message && errors.message
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-300 focus:border-green focus:ring-green/20"
              }`}
            />
            {touched.message && errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
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
