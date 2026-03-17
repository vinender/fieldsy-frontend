import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Book the perfect field for your dog's playtime" />

        {/* Preconnect to S3 for faster image loading */}
        <link rel="preconnect" href="https://fieldsy-s3.s3.eu-west-2.amazonaws.com" />
        <link rel="dns-prefetch" href="https://fieldsy-s3.s3.eu-west-2.amazonaws.com" />

        {/* Preconnect to Stripe for faster payment form loading */}
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://api.stripe.com" />
        
        {/* Favicon References */}
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon/android-chrome-512x512.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* Additional meta tags for better app experience */}
        <meta name="theme-color" content="#3A6B22" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>
      <body suppressHydrationWarning>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}