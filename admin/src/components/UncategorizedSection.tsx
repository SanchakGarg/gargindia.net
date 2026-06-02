'use client'

import { useDroppable } from '@dnd-kit/core'
import ImageCard from './ImageCard'
import type { Image, CategoryWithImages } from '@/lib/types'

export default function UncategorizedSection({
  images,
  categories,
}: {
  images: Image[]
  categories: CategoryWithImages[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: '__uncategorized__' })

  if (images.length === 0 && !isOver) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full shrink-0 bg-gray-300" />
        <h3 className="font-semibold text-gray-500">Uncategorized</h3>
        <span className="text-xs text-gray-400">({images.length})</span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-16 rounded-xl transition-colors ${isOver ? 'bg-red-50 ring-2 ring-red-300' : ''}`}
      >
        {images.length === 0 ? (
          <p className={`text-sm py-6 text-center ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
            {isOver ? 'Drop here' : 'No uncategorized images'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {images.map(img => (
              <ImageCard
                key={img.id}
                image={img}
                currentCategoryId={null}
                allCategories={categories}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
