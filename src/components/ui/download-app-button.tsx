import Image from "next/image"
import { cn } from "@/lib/utils"

interface DownloadAppButtonProps {
  className?: string
  onClick?: () => void
}

export function DownloadAppButton({ className, onClick }: DownloadAppButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-light-green text-dark-green font-semibold text-sm sm:text-base lg:text-lg",
        "rounded-[70px] py-3 sm:py-[14px] px-6 sm:px-[28px]",
        "flex items-center gap-2 sm:gap-3",
        "hover:bg-light-green/90 transition-colors",
        className
      )}
    >
      <span className='text-white font-[700]'>Download App</span>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Image
          src="/android-btn.svg"
          alt="Android"
          width={20}
          height={20}
          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
        />
        <Image
          src="/ios-btn.svg"
          alt="iOS"
          width={20}
          height={20}
          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
        />
      </div>
      
    </button>
  )
}
