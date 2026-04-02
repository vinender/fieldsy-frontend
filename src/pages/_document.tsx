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
        {/* Pre-hydration loading screen — prevents SSG landing page flash for authenticated users.
            Only shows if a session cookie exists (user is likely logged in).
            Covers the raw HTML until React hydrates and takes over rendering. */}
        <div id="__pre-hydration-loader" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFCF3' }}>
          <div style={{ width: 40, height: 40, border: '4px solid rgba(58,107,34,0.3)', borderTopColor: '#3A6B22', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style dangerouslySetInnerHTML={{ __html: '@keyframes spin{to{transform:rotate(360deg)}}' }} />
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var c=document.cookie;
            if(c.indexOf('next-auth.session-token')!==-1||c.indexOf('__Secure-next-auth.session-token')!==-1){
              var el=document.getElementById('__pre-hydration-loader');
              if(el)el.style.display='flex';
            }
          })();
        `}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}