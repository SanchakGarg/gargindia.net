'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { moveImage } from '@/app/actions'
import CategorySection from './CategorySection'
import UncategorizedSection from './UncategorizedSection'
import type { CategoryWithImages, Image } from '@/lib/types'

export default function DashboardClient({
  categories,
  uncategorized,
}: {
  categories: CategoryWithImages[]
  uncategorized: Image[]
}) {
  const router = useRouter()
  const [activeImage, setActiveImage] = useState<Image | null>(null)
  const [moving, setMoving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveImage(active.data.current?.image ?? null)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveImage(null)
    if (!over) return

    const imageId = active.id as string
    const fromCategoryId: string | null = active.data.current?.categoryId ?? null
    const toCategoryId: string | null = over.id === '__uncategorized__' ? null : over.id as string

    if (fromCategoryId === toCategoryId) return

    setMoving(true)
    try {
      await moveImage(imageId, toCategoryId)
      router.refresh()
    } finally {
      setMoving(false)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {categories.map(cat => (
          <CategorySection key={cat.id} category={cat} allCategories={categories} />
        ))}
        <UncategorizedSection images={uncategorized} categories={categories} />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeImage && (
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-2xl border-2 border-white rotate-3 opacity-95">
            <img src={activeImage.url} className="w-full h-full object-cover" alt="" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
