import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garg India and Engineering Works',
  description: 'Product catalogue for Garg India and Engineering Works — engineering supplies and equipment in Tri-Nagar, New Delhi.',
  keywords: ['electrical', 'garg india', 'tri-nagar', 'delhi', 'electrical works'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
