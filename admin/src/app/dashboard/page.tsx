import { createSupabaseAdmin } from '@/lib/supabase'
import type { CategoryWithImages, Category, Image } from '@/lib/types'
import AdminNav from '@/components/AdminNav'
import ImageUploader from '@/components/ImageUploader'
import CategorySection from '@/components/CategorySection'

async function getData(): Promise<CategoryWithImages[]> {
  const admin = createSupabaseAdmin()

  const { data: catRaw } = await admin
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  const categories = catRaw as Category[] | null
  if (!categories || categories.length === 0) return []

  const { data: imgRaw } = await admin
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })

  const images = (imgRaw as Image[] | null) ?? []
  const imageMap = new Map<string, Image[]>()
  for (const img of images) {
    if (!img.category_id) continue
    const arr = imageMap.get(img.category_id) ?? []
    arr.push(img)
    imageMap.set(img.category_id, arr)
  }

  return categories.map((cat) => ({
    ...cat,
    images: imageMap.get(cat.id) ?? [] as Image[],
  }))
}

export default async function DashboardPage() {
  const categories = await getData()

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <ImageUploader categories={categories} />
        <div className="space-y-8">
          {categories.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No categories yet. Add one above.</p>
          ) : (
            categories.map((cat) => (
              <CategorySection key={cat.id} category={cat} allCategories={categories} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
