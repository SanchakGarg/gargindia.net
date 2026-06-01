'use client'

import { logout } from '@/app/actions'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, LogOut, LayoutGrid } from 'lucide-react'

export default function AdminNav() {
  const path = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2"
            style={{ backgroundColor: '#dc2626' }}
          >
            G
          </span>
          <span className="font-semibold text-gray-900 text-sm">Garg India Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              path === '/dashboard' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutGrid size={15} />
            Catalogue
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              path === '/settings' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings size={15} />
            Settings
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
