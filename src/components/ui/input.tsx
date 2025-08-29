import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "./input.module.css"

function Input({ className, type, style, placeholder, ...props }: React.ComponentProps<"input">) {
  // Create a unique class name for this input to apply styles
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (inputRef.current) {
      // Apply placeholder styles directly via JavaScript
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        input[data-slot="input"]::placeholder {
          color: rgb(153, 154, 155) !important;
          opacity: 1 !important;
        }
        input[data-slot="input"]::-webkit-input-placeholder {
          color: rgb(153, 154, 155) !important;
          opacity: 1 !important;
        }
        input[data-slot="input"]::-moz-placeholder {
          color: rgb(153, 154, 155) !important;
          opacity: 1 !important;
        }
        input[data-slot="input"]:-ms-input-placeholder {
          color: rgb(153, 154, 155) !important;
          opacity: 1 !important;
        }
        input[data-slot="input"]:focus::placeholder {
          color: rgb(153, 154, 155) !important;
          opacity: 1 !important;
        }
      `;
      // Only add if not already added
      if (!document.head.querySelector('[data-input-placeholder-styles]')) {
        styleSheet.setAttribute('data-input-placeholder-styles', 'true');
        document.head.appendChild(styleSheet);
      }
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      placeholder={placeholder}
      style={{
        ...style
      }}
      className={cn(
        styles.input,
        // Base styles
        "flex w-full rounded-[70px] border bg-white px-[16px] py-[8px] text-base transition-all duration-200",
        
        // Text color - dark gray for input text
        "text-gray-800",
        
        // Placeholder - light gray color (gray-200)
        "[&::placeholder]:text-gray-200",
        "[&::placeholder]:opacity-100",
        "[&:focus::placeholder]:text-gray-200",
        "[&:focus::placeholder]:opacity-100",
        
        // Maintain text color on all states
        "focus:text-gray-800",
        "hover:text-gray-800", 
        "active:text-gray-800",
        
        // Autofill styles to maintain consistent text color
        "autofill:text-gray-800",
        "[&:-webkit-autofill]:text-gray-800",
        "[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(31,41,55)]",
        "[&:-webkit-autofill:hover]:[-webkit-text-fill-color:rgb(31,41,55)]",
        "[&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgb(31,41,55)]",
        "[&:-webkit-autofill:active]:[-webkit-text-fill-color:rgb(31,41,55)]",
        
        // Border
        "border-gray-300",
        
        // Shadow
        "shadow-sm",
        
        // Focus states
        "focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20",
        
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