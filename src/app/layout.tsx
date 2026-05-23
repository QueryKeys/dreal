import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crypto Dashboard - Wyckoff+ Signal Engine',
  description: 'Professional crypto trading dashboard with Wyckoff analysis',
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
