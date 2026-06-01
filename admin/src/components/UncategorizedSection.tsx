'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Trash2, GripVertical, Move } from 'lucide-react'
import { deleteImage, moveImage } from '@/app/actions'
import type { Image, CategoryWithImages } from '@/lib/types'

function DraggableImage({
  image,
  categories,
}: {
  image: Image
  categories: CategoryWithImages[]
}) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: image.id,
    data: { image, categoryId: null },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined

  async function handleDelete() {
    if (!confirm('Delete this image?')) return
    setDeleting(true)
    await deleteImage(image.id, image.storage_path)
    router.refresh()
  }

  async function handleMove(catId: string) {
    setMoving(true)
    setShowActions(false)
    await moveImage(image.id, catId)
    router.refresh()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 ${isDragging ? 'opacity-30' : ''}`}
    >
      <div
        {...listeners}
        {...attributes}
        className="absolute top-1.5 left-1.5 z-10 w-6 h-6 bg-black/50 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={12} className="text-white" />
      </div>

      <img src={image.url} alt={image.filename} className="w-full h-auto block" loading="lazy" />

      <button
        onClick={() => setShowActions(v => !v)}
        className="absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-black/50 rounded-md flex items-center justify-center"
      >
        <Move size={11} className="text-white" />
      </button>

      {showActions && (
        <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 p-2 space-y-1.5 z-20">
          <select
            disabled={moving}
            defaultValue=""
            onChange={e => handleMove(e.target.value)}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="" disabled>Move to category…</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

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
              <DraggableImage key={img.id} image={img} categories={categories} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
