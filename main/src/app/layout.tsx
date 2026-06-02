import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garg Electrical and Engineering Works',
  description: 'Product catalogue for Garg Electrical and Engineering Works — electrical, engineering, and hydraulics supplies in Tri-Nagar, North Delhi.',
  keywords: ['electrical', 'engineering', 'hydraulics', 'garg india', 'tri-nagar', 'delhi'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
