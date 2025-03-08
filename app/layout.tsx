import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'N-Queen Solver (Backtracking)',
  description: 'Developed by Mainak Sen',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
