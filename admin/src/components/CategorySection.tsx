'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useDroppable } from '@dnd-kit/core'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { renameCategory, deleteCategory } from '@/app/actions'
import ImageCard from './ImageCard'
import type { CategoryWithImages } from '@/lib/types'

function DroppableGrid({
  id,
  children,
  isEmpty,
}: {
  id: string
  children: React.ReactNode
  isEmpty: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-16 rounded-xl transition-colors ${isOver ? 'bg-red-50 ring-2 ring-red-300' : ''}`}
    >
      {isEmpty ? (
        <p className={`text-sm py-6 text-center ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
          {isOver ? 'Drop here' : 'No images yet'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {children}
        </div>
      )}
    </div>
  )
}

export default function CategorySection({
  category,
  allCategories,
}: {
  category: CategoryWithImages
  allCategories: CategoryWithImages[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [renameState, renameAction, renamePending] = useActionState(renameCategory, { error: '' })

  async function handleDelete() {
    const count = category.images.length
    const msg = count > 0
      ? `Delete "${category.name}" and its ${count} image${count !== 1 ? 's' : ''}?`
      : `Delete category "${category.name}"?`
    if (!confirm(msg)) return
    await deleteCategory(category.id)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        {editing ? (
          <form
            action={async (fd) => {
              fd.append('id', category.id)
              await renameAction(fd)
              setEditing(false)
              router.refresh()
            }}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <input
              name="name"
              defaultValue={category.name}
              autoFocus
              className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold flex-1 min-w-0 focus:outline-none"
            />
            <button type="submit" disabled={renamePending} className="text-green-600 shrink-0 p-1">
              <Check size={16} />
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-gray-400 shrink-0 p-1">
              <X size={16} />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div style={{ backgroundColor: '#dc2626' }} className="w-1 h-5 rounded-full shrink-0" />
            <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
            <span className="text-xs text-gray-400 shrink-0">({category.images.length})</span>
            <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-600 shrink-0 p-1">
              <Pencil size={13} />
            </button>
          </div>
        )}
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs shrink-0 p-1"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {renameState.error && <p className="text-xs text-red-600">{renameState.error}</p>}

      <DroppableGrid id={category.id} isEmpty={category.images.length === 0}>
        {category.images.map(img => (
          <ImageCard
            key={img.id}
            image={img}
            currentCategoryId={category.id}
            allCategories={allCategories}
          />
        ))}
      </DroppableGrid>
    </div>
  )
}
