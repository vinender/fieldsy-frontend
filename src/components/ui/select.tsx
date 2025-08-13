"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        // Keep styling minimal so consumers can fully control visuals
        "bg-white text-gray-input border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }


