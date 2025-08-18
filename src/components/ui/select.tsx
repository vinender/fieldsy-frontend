"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Select({ className, children, style, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      style={{
        color: 'rgb(31, 41, 55)', // gray-800
        WebkitTextFillColor: 'rgb(31, 41, 55)', // Ensures consistent text color
        ...style
      }}
      className={cn(
        // Base styling with dark text
        "bg-white text-gray-800 border border-gray-300",
        // Placeholder (first option if it has empty value)
        "[&>option[value='']]:text-placeholder-gray",
        // Focus states
        "focus:text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20",
        // Hover state
        "hover:text-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }


