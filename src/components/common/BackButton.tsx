import React, { useEffect, useRef } from 'react';
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
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const storedCurrent = sessionStorage.getItem('fieldsy_current_path');

    if (storedCurrent && storedCurrent !== currentPath) {
      sessionStorage.setItem('fieldsy_previous_path', storedCurrent);
    }

    sessionStorage.setItem('fieldsy_current_path', currentPath);
    previousPathRef.current = sessionStorage.getItem('fieldsy_previous_path');
  }, [router.asPath]);

  const navigateToFallback = () => {
    const fallbackPath = previousPathRef.current;

    if (fallbackPath && fallbackPath !== router.asPath) {
      router.push(fallbackPath);
      return;
    }

    if (typeof window !== 'undefined' && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin) {
          router.push(refUrl.pathname + refUrl.search + refUrl.hash);
          return;
        }
        window.location.href = refUrl.toString();
        return;
      } catch {
        router.push('/');
        return;
      }
    }

    router.push('/');
  };

  const canUseNativeBack = () => {
    if (typeof window === 'undefined') return false;
    const historyState = window.history.state;
    if (historyState && typeof historyState.idx === 'number') {
      return historyState.idx > 0;
    }
    return window.history.length > 1;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      if (canUseNativeBack()) {
        router.back();
      } else {
        navigateToFallback();
      }
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
        <span className="font-[600] text-[16px] sm:text-[20px] md:text-[24px] lg:text-[29px] leading-tight sm:leading-[20px] text-dark-green font-sans">
          {label}
        </span>
      )}
    </div>
  );
}
