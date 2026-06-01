'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Pencil, Trash2, Check, X, GripVertical, Move } from 'lucide-react'
import { renameCategory, deleteCategory, deleteImage, moveImage } from '@/app/actions'
import type { CategoryWithImages, Image } from '@/lib/types'

function DraggableImage({
  image,
  categoryId,
  allCategories,
}: {
  image: Image
  categoryId: string
  allCategories: CategoryWithImages[]
}) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: image.id,
    data: { image, categoryId },
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

  async function handleMove(val: string) {
    setMoving(true)
    setShowActions(false)
    await moveImage(image.id, val === '__none__' ? null : val)
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

      {/* Action button — always visible */}
      <button
        onClick={() => setShowActions(v => !v)}
        className="absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-black/50 rounded-md flex items-center justify-center"
      >
        <Move size={11} className="text-white" />
      </button>

      {/* Action panel */}
      {showActions && (
        <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 p-2 space-y-1.5 z-20">
          <select
            disabled={moving}
            defaultValue=""
            onChange={e => handleMove(e.target.value)}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="" disabled>Move to…</option>
            {allCategories
              .filter(c => c.id !== categoryId)
              .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            }
            <option value="__none__">Uncategorized</option>
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
          <DraggableImage
            key={img.id}
            image={img}
            categoryId={category.id}
            allCategories={allCategories}
          />
        ))}
      </DroppableGrid>
    </div>
  )
}
