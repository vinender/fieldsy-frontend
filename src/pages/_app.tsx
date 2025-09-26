import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { useRouter } from "next/router"
import dynamic from "next/dynamic"
import { DM_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { SocketProvider } from "@/contexts/SocketContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { ChatProvider } from "@/contexts/ChatContext"
import { SkeletonProvider } from "@/contexts/SkeletonContext"
import { NavigationLoaderProvider } from "@/contexts/NavigationLoaderContext"
import { SessionMonitor } from "@/components/auth/SessionMonitor"
import NavigationLoader from "@/components/common/NavigationLoader"
import "@/styles/globals.css"
import "@/lib/utils/suppress-dev-errors"

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
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  // Add more paths as needed
]

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
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

  // Check if current path should hide header/footer
  const hideLayout = noLayoutPaths.some(path => 
    router.pathname.startsWith(path)
  )

  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes instead of constantly
      refetchOnWindowFocus={false} // Disable refetch on window focus
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocationProvider>
            <NotificationProvider>
              <SocketProvider>
                <ChatProvider>
                  <SkeletonProvider>
                    <NavigationLoaderProvider>
                      <SessionMonitor />
                      <NavigationLoader />
                      <div className={`${dmSans.variable} font-sans antialiased overflow-x-hidden`}>
                        <div className="min-h-screen flex flex-col overflow-x-hidden">
                          {!hideLayout && <Header />}
                          <main className="flex-grow overflow-x-hidden">
                            <Component {...pageProps} />
                          </main>
                          {!hideLayout && <Footer />}
                        </div>
                        <Toaster 
                        toastOptions={{
                          style: {
                            background: '#2D3748', // Dark gray background
                            color: '#FFFFFF', // White text
                            border: '1px solid #4A5568', // Slightly lighter border
                          },
                          className: 'sonner-toast',
                          descriptionClassName: 'sonner-description',
                        }}
                        richColors
                      />
                    </div>
                    </NavigationLoaderProvider>
                  </SkeletonProvider>
                </ChatProvider>
              </SocketProvider>
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  )
}