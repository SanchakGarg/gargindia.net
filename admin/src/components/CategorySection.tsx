'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Check, X, Move } from 'lucide-react'
import { renameCategory, deleteCategory, deleteImage, moveImage } from '@/app/actions'
import type { CategoryWithImages, Image } from '@/lib/types'

function ImageCard({
  image,
  allCategories,
  currentCategoryId,
}: {
  image: Image
  allCategories: CategoryWithImages[]
  currentCategoryId: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this image?')) return
    setDeleting(true)
    await deleteImage(image.id, image.storage_path)
    router.refresh()
  }

  async function handleMove(newCatId: string) {
    setMoving(true)
    await moveImage(image.id, newCatId)
    router.refresh()
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
      <img src={image.url} alt={image.filename} className="w-full h-auto block" loading="lazy" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center pb-2 gap-1.5 opacity-0 group-hover:opacity-100">
        <select
          disabled={moving}
          onChange={(e) => handleMove(e.target.value)}
          value={currentCategoryId}
          className="text-xs bg-white/90 rounded px-1.5 py-1 border-0 outline-0 max-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-7 h-7 bg-red-600 rounded text-white flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
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
      ? `Delete "${category.name}" and its ${count} image${count > 1 ? 's' : ''}?`
      : `Delete category "${category.name}"?`
    if (!confirm(msg)) return
    await deleteCategory(category.id)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        {editing ? (
          <form
            action={async (fd) => {
              fd.append('id', category.id)
              await renameAction(fd)
              setEditing(false)
              router.refresh()
            }}
            className="flex items-center gap-2 flex-1"
          >
            <input
              name="name"
              defaultValue={category.name}
              autoFocus
              className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold flex-1 max-w-xs focus:outline-none"
            />
            <button type="submit" disabled={renamePending} className="text-green-600 hover:text-green-700">
              <Check size={16} />
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: '#dc2626' }} className="w-1 h-5 rounded-full shrink-0" />
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <span className="text-xs text-gray-400">({category.images.length})</span>
            <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-600 ml-1">
              <Pencil size={13} />
            </button>
          </div>
        )}
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors text-xs flex items-center gap-1"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>

      {renameState.error && <p className="text-xs text-red-600">{renameState.error}</p>}

      {category.images.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No images yet</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {category.images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              allCategories={allCategories}
              currentCategoryId={category.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
