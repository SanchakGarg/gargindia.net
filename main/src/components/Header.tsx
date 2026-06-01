import { Phone, MapPin } from 'lucide-react'

export default function Header() {
  return (
    <header style={{ backgroundColor: '#dc2626' }} className="text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-tight">Garg India</h1>
          <p className="text-xs opacity-90 tracking-wide">and Electrical Works</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="tel:+919899303030"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity font-medium"
          >
            <Phone size={15} />
            +91 98993 03030
          </a>
        </div>
      </div>
    </header>
  )
}
