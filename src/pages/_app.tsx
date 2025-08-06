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
import "@/styles/globals.css"

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
        <div className={`${dmSans.variable} font-sans antialiased overflow-x-hidden`}>
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            {!hideLayout && <Header />}
            <main className="flex-grow overflow-x-hidden">
              <Component {...pageProps} />
            </main>
            {!hideLayout && <Footer />}
          </div>
          <Toaster />
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}