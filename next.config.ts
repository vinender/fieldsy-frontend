import type { NextConfig } from "next";


console.log('--- ENV DEBUG ---');
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('-----------------');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Suppress ECONNRESET errors in development (happens when browser cancels requests during hot reload)
if (process.env.NODE_ENV === 'development') {
  const originalEmit = process.emit;
  // @ts-ignore
  process.emit = function (event: string, error: any) {
    if (
      event === 'uncaughtException' &&
      error?.code === 'ECONNRESET' &&
      error?.message?.includes('aborted')
    ) {
      // Suppress this error - it's harmless in development
      return false;
    }
    // @ts-ignore
    return originalEmit.apply(process, arguments);
  };
}

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60, // 1 hour — prevents stale images when S3 objects change
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fieldsy-s3.s3.eu-west-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      // Imported field images from external sources
      {
        protocol: 'https',
        hostname: 'dogwalkingfields.co.uk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'britishdogfields.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wordpress.com',
        port: '',
        pathname: '/**',
      },
      // Wildcard patterns removed — use specific hostnames above for security
    ],
  },

  // Production source maps (disabled for smaller builds)
  productionBrowserSourceMaps: false,

  // Compression
  compress: true,

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'react-hook-form',
      'zod',
      'date-fns',
      'axios',
    ],
  },

  // Disable strict mode in development to prevent hydration issues
  reactStrictMode: false,

  // Module federation for code splitting
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },

  // Headers for caching and security
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        // Static assets (JS/CSS bundles) — these have content hashes, safe to cache long
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev ? 'no-store' : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Images served from public/ — cache 1 hour, revalidate in background
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev ? 'no-cache' : 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Next.js image optimization endpoint — cache 1 hour, revalidate in background
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev ? 'no-cache' : 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
