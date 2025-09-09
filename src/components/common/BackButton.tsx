import React from 'react';
import { useRouter } from 'next/router';

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: 'cream' | 'light' | 'default';
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BackButton({ 
  label = 'Back',
  onClick,
  variant = 'cream',
  showLabel = false,
  className = '',
  size = 'md'
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const bgClasses = {
    cream: 'bg-cream hover:bg-cream/80',
    light: 'bg-light hover:bg-light/80',
    default: 'bg-gray-100 hover:bg-gray-200'
  };

  const svgPath = variant === 'cream' ? '/cream-back.svg' : '/back.svg';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button 
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          ${bgClasses[variant]}
          rounded-full flex items-center justify-center 
          transition-all duration-200 
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-green
        `}
        aria-label={label}
      >
        <img 
          src={svgPath} 
          alt="Back" 
          className={`${iconSizes[size]}  pointer-events-none`}
        />
      </button>
      {showLabel && (
        <span className="font-[600] text-[29px] leading-[20px] text-dark-green font-sans">
          {label}
        </span>
      )}
    </div>
  );
}