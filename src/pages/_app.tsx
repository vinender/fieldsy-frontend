import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { useRouter } from "next/router"
import { DM_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { SocketProvider } from "@/contexts/SocketContext"
import "@/styles/globals.css"
import "@/lib/utils/suppress-dev-errors"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

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
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
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
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}