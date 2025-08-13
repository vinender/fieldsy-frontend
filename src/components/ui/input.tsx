import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      style={{
        color: '#6B6B6B',
        WebkitTextFillColor: '#6B6B6B',
        ...style
      }}
      className={cn(
        // Base styles
        "flex w-full rounded-[70px] border bg-white px-[16px] py-[8px] text-base transition-all duration-200",
        
        // Text and placeholder - FORCE gray color
        "text-[#6B6B6B] placeholder:text-gray-400",
        "[color:#6B6B6B_!important]",
        
        // Force text color on all states
        "focus:text-[#6B6B6B]",
        "hover:text-[#6B6B6B]",
        "active:text-[#6B6B6B]",
        
        // Border
        "border-gray-300",
        
        // Shadow
        "shadow-sm",
        
        // Focus states
        "focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20",
        
        // Hover
        "hover:border-gray-400",
        
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300",
        
        // Invalid state
        "aria-invalid:border-red-500 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-500/20",
        
        // File input specific
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        
        // Dark mode support (optional)
        // "dark:bg-dark-green dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500",
        // "dark:focus:border-light-green dark:focus:ring-light-green/20",
        
        className
      )}
      {...props}
    />
  )
}

export { Input }