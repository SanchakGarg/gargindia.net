export const dynamic = 'force-dynamic'

import { createSupabaseAdmin } from '@/lib/supabase'
import type { CategoryWithImages, Category, Image } from '@/lib/types'
import AdminNav from '@/components/AdminNav'
import ImageUploader from '@/components/ImageUploader'
import DashboardClient from '@/components/DashboardClient'

async function getData() {
  const admin = createSupabaseAdmin()

  const { data: catRaw } = await admin
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  const categories = (catRaw as Category[] | null) ?? []

  const { data: imgRaw } = await admin
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })

  const allImages = (imgRaw as Image[] | null) ?? []

  const imageMap = new Map<string, Image[]>()
  const uncategorized: Image[] = []

  for (const img of allImages) {
    if (!img.category_id) {
      uncategorized.push(img)
    } else {
      const arr = imageMap.get(img.category_id) ?? []
      arr.push(img)
      imageMap.set(img.category_id, arr)
    }
  }

  const categoriesWithImages: CategoryWithImages[] = categories.map(cat => ({
    ...cat,
    images: imageMap.get(cat.id) ?? [] as Image[],
  }))

  return { categories: categoriesWithImages, uncategorized }
}

export default async function DashboardPage() {
  const { categories, uncategorized } = await getData()

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        <ImageUploader categories={categories} />
        {categories.length === 0 && uncategorized.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No images yet. Upload some above.</p>
        ) : (
          <DashboardClient categories={categories} uncategorized={uncategorized} />
        )}
      </main>
    </div>
  )
}
