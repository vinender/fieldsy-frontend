"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      gap={16}
      offset="20px"
      expand={false}
      visibleToasts={3}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#000000",
          "--normal-border": "#e5e5e5",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
