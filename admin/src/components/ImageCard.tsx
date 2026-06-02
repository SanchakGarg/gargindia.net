'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDraggable } from '@dnd-kit/core'
import { GripVertical, Move, Trash2 } from 'lucide-react'
import { deleteImage, moveImage } from '@/app/actions'
import type { Image, CategoryWithImages } from '@/lib/types'

export default function ImageCard({
  image,
  currentCategoryId,
  allCategories,
}: {
  image: Image
  currentCategoryId: string | null
  allCategories: CategoryWithImages[]
}) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: image.id,
    data: { image, categoryId: currentCategoryId },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined

  const filtered = allCategories
    .filter(c => c.id !== currentCategoryId)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  const showUncategorized =
    currentCategoryId !== null &&
    (!search || 'uncategorized'.includes(search.toLowerCase()))

  async function handleDelete() {
    if (!confirm('Delete this image?')) return
    setDeleting(true)
    await deleteImage(image.id, image.storage_path)
    router.refresh()
  }

  async function handleMove(newCatId: string | null) {
    setMoving(true)
    setShowActions(false)
    setSearch('')
    await moveImage(image.id, newCatId)
    router.refresh()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 ${isDragging ? 'opacity-30' : ''}`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-1.5 left-1.5 z-10 w-6 h-6 bg-black/50 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={12} className="text-white" />
      </div>

      <img src={image.url} alt={image.filename} className="w-full h-auto block" loading="lazy" />

      {/* Action toggle */}
      <button
        onClick={() => { setShowActions(v => !v); setSearch('') }}
        className="absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-black/50 rounded-md flex items-center justify-center"
      >
        <Move size={11} className="text-white" />
      </button>

      {showActions && (
        <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 z-20 rounded-b-xl shadow-lg overflow-hidden">
          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={11} />
            {deleting ? 'Deleting…' : 'Delete Image'}
          </button>

          {/* Search */}
          <div className="px-2 py-1.5 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search category…"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Category list */}
          <div className="max-h-24 overflow-y-auto">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => handleMove(c.id)}
                disabled={moving}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 truncate block"
              >
                {c.name}
              </button>
            ))}
            {showUncategorized && (
              <button
                onClick={() => handleMove(null)}
                disabled={moving}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 text-gray-400 italic block"
              >
                Uncategorized
              </button>
            )}
            {filtered.length === 0 && !showUncategorized && (
              <p className="text-xs text-gray-400 px-3 py-2 text-center">No categories found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
