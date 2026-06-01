import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garg India and Electrical Works',
  description: 'Product catalogue for Garg India and Electrical Works — electrical supplies and equipment in Tri-Nagar, New Delhi.',
  keywords: ['electrical', 'garg india', 'tri-nagar', 'delhi', 'electrical works'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
