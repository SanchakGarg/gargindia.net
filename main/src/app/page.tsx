import { createClient } from '@supabase/supabase-js'
import type { CategoryWithImages, Image } from '@/lib/types'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import CatalogueSection from '@/components/CatalogueSection'

export const revalidate = 120 // 2-min fallback; on-demand revalidation triggered by admin

async function getCatalogue(): Promise<CategoryWithImages[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  const categories = (categoriesData as CategoryWithImages[] | null)
  if (!categories || categories.length === 0) return []

  const { data: imagesData } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: true })

  const images = (imagesData as Image[] | null) ?? []
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

export default async function HomePage() {
  const categories = await getCatalogue()

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />

      <div className="py-6 px-4 max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-gray-400 text-center">Product Catalogue</p>
      </div>

      <div className="flex-1">
        <CatalogueSection categories={categories} />
      </div>

      <footer style={{ backgroundColor: '#dc2626' }} className="text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm opacity-90 space-y-1">
          <p className="font-semibold">Garg Electrical and Engineering Works</p>
          <p>4201, Hansapuri Road, Tri-Nagar, New Delhi</p>
          <p>
            <a href="tel:+919899303030" className="hover:opacity-75 transition-opacity">
              +91 98993 03030
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
