export const metadata = {
  title: {
    default: 'Fieldsy - Book Dog Fields Online',
    template: '%s | Fieldsy',
  },
  description: "Book the perfect field for your dog's playtime",
  metadataBase: new URL('https://fieldsy.co.uk'),
  openGraph: {
    title: 'Fieldsy - Book Dog Fields Online',
    description: "Book the perfect field for your dog's playtime",
    url: 'https://fieldsy.co.uk',
    siteName: 'Fieldsy',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
