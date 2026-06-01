import type { CategoryWithImages } from '@/lib/types'
import ImageGrid from './ImageGrid'

export default function CatalogueSection({ categories }: { categories: CategoryWithImages[] }) {
  if (categories.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg">Catalogue coming soon.</p>
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 space-y-14">
      {categories.map((cat) => (
        <div key={cat.id}>
          {/* Category divider */}
          <div className="flex items-center gap-4 mb-6">
            <div style={{ backgroundColor: '#dc2626' }} className="h-0.5 w-8 shrink-0" />
            <h3 className="text-xl font-bold tracking-tight text-gray-900 uppercase">{cat.name}</h3>
            <div style={{ backgroundColor: '#dc2626' }} className="h-0.5 flex-1" />
          </div>
          <ImageGrid images={cat.images} />
        </div>
      ))}
    </section>
  )
}
