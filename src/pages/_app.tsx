import type { AppProps } from "next/app"
import Head from "next/head"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { DM_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { cn } from "@/lib/utils"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { SocketProvider } from "@/contexts/SocketContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { ChatProvider } from "@/contexts/ChatContext"
import { MessageSocketProvider } from "@/contexts/MessageSocketContext"
import { NavigationLoaderProvider } from "@/contexts/NavigationLoaderContext"
import { usePublicSettings } from "@/hooks/usePublicSettings"
import { PushNotificationProvider } from "@/components/providers/PushNotificationProvider"
import { SessionMonitor } from "@/components/auth/SessionMonitor"
import NavigationLoader from "@/components/common/NavigationLoader"
import ErrorBoundary from "@/components/common/ErrorBoundary"
import "@/styles/globals.css"
import "@/lib/utils/suppress-dev-errors"
import { useRouter } from "next/router"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

// Dynamically import ReactQueryDevtools (client-side only)
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools),
  { ssr: false }
)

// Define paths where header and footer should be hidden
const noLayoutPaths = [
  '/login',
  '/register',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  // Add more paths as needed
]

function reportClientError(message: string, stack?: string) {
  try {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/error-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        stack,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    }).catch(() => {});
  } catch (_) {}
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // Global error handlers for uncaught client-side errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportClientError(event.message, event.error?.stack);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || String(event.reason);
      reportClientError(`Unhandled Promise Rejection: ${msg}`, event.reason?.stack);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
            gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnMount: false, // Don't refetch on component mount if data exists
            refetchOnReconnect: false, // Don't refetch on reconnect
            retry: 1, // Only retry once on failure
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Don't retry mutations by default
            retry: false,
            // Handle errors globally (but let individual mutations override)
            onError: (error: any) => {
              // Errors are handled in individual mutation hooks
              // This prevents unhandled promise rejections
              if (process.env.NODE_ENV === 'development') {
                console.log('Mutation error handled:', error?.response?.status);
              }
            },
          },
        },
      })
  )

  // Disable session refetching in development to prevent reload loops
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <>
      <Head>
        <title>Fieldsy - Book Dog Fields Online</title>
      </Head>
      <SessionProvider
        session={session}
        refetchInterval={isDevelopment ? 0 : 15 * 60} // Disable in dev, 15 min in prod
        refetchOnWindowFocus={false} // Disable refetch on window focus
        refetchWhenOffline={false} // Don't refetch when offline
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppShell Component={Component} pageProps={pageProps} fontClassName={dmSans.variable} />
          </AuthProvider>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </SessionProvider>
    </>
  )
}

type AppShellProps = {
  Component: AppProps['Component']
  pageProps: AppProps['pageProps']
  fontClassName: string
}

function AppShell({ Component, pageProps, fontClassName }: AppShellProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  // Wait for client-side mount before rendering providers that use browser APIs
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isAuthenticated = !!user

  // Site Live Check for Layout
  const { data: settings } = usePublicSettings();
  const isComingSoonMode = settings && settings.isLive === false && !settings.hasAccess;

  // Check if we are in mobile app mode (no header/footer)
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const params = new URLSearchParams(window.location.search);
        const isApp = params.get('mobile') === 'true' ||
          params.get('source') === 'mobile' ||
          params.get('app') === 'true';

        setIsMobileApp(isApp);
      };

      checkMobile();
      // Also check on route change to handle internal navigation
      router.events.on('routeChangeComplete', checkMobile);
      return () => router.events.off('routeChangeComplete', checkMobile);
    }
  }, [router]);

  const hideLayout = noLayoutPaths.some(path => router.pathname.startsWith(path)) || isComingSoonMode || isMobileApp;
  const isMessagesPage = router.pathname === '/user/messages'

  const pageContent = (
    <ErrorBoundary>
      <div className={`${fontClassName} font-sans antialiased overflow-x-hidden`} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          {!hideLayout && <Header />}
          <main className={cn("flex-grow overflow-x-hidden", !hideLayout ? "" : "pt-0")}>
            <ErrorBoundary>
              {isMessagesPage && isAuthenticated ? (
                <MessageSocketProvider>
                  <Component {...pageProps} />
                </MessageSocketProvider>
              ) : (
                <Component {...pageProps} />
              )}
            </ErrorBoundary>
          </main>
          {!hideLayout && !isMessagesPage && <Footer />}
        </div>
        <Toaster
          position="top-right"
          expand={true}
          visibleToasts={3}
          gap={12}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          }}
          richColors
        />
      </div>
    </ErrorBoundary>
  )

  // During SSR, render without socket/notification providers to avoid hydration issues
  if (!isMounted) {
    return (
      <NavigationLoaderProvider>
        <NavigationLoader />
        {pageContent}
      </NavigationLoaderProvider>
    )
  }

  return (
    <LocationProvider>
      <NotificationProvider>
        <SocketProvider>
          <PushNotificationProvider>
            <ChatProvider>
              {isAuthenticated ? (
                <NavigationLoaderProvider>
                  <SessionMonitor />
                  <NavigationLoader />
                  {pageContent}
                </NavigationLoaderProvider>
              ) : (
                <NavigationLoaderProvider>
                  <NavigationLoader />
                  {pageContent}
                </NavigationLoaderProvider>
              )}
            </ChatProvider>
          </PushNotificationProvider>
        </SocketProvider>
      </NotificationProvider>
    </LocationProvider>
  )
}
