import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSkeleton } from '@/contexts/SkeletonContext';

interface ResponsiveLinkProps extends Omit<React.ComponentProps<typeof Link>, 'onClick'> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const ResponsiveLink: React.FC<ResponsiveLinkProps> = ({ 
  children, 
  href, 
  className,
  onClick,
  ...props 
}) => {
  const router = useRouter();
  const { startNavigation } = useSkeleton();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetUrl = typeof href === 'string' ? href : href.pathname || '';
    
    if (targetUrl !== router.asPath && !targetUrl.startsWith('#') && !targetUrl.startsWith('http')) {
      startNavigation(targetUrl);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link 
      href={href} 
      {...props}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
};