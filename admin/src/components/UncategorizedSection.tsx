'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteImage, moveImage } from '@/app/actions'
import type { Image, CategoryWithImages } from '@/lib/types'

function ImageCard({ image, categories }: { image: Image; categories: CategoryWithImages[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this image?')) return
    setDeleting(true)
    await deleteImage(image.id, image.storage_path)
    router.refresh()
  }

  async function handleMove(catId: string) {
    setMoving(true)
    await moveImage(image.id, catId === '' ? null : catId)
    router.refresh()
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
      <img src={image.url} alt={image.filename} className="w-full h-auto block" loading="lazy" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center pb-2 gap-1.5 opacity-0 group-hover:opacity-100">
        <select
          disabled={moving}
          defaultValue=""
          onChange={e => handleMove(e.target.value)}
          className="text-xs bg-white/90 rounded px-1.5 py-1 border-0 outline-0 max-w-[130px]"
          onClick={e => e.stopPropagation()}
        >
          <option value="" disabled>Move to…</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-7 h-7 bg-red-600 rounded text-white flex items-center justify-center hover:bg-red-700 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
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
  if (images.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full shrink-0 bg-gray-300" />
        <h3 className="font-semibold text-gray-500">Uncategorized</h3>
        <span className="text-xs text-gray-400">({images.length})</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {images.map(img => (
          <ImageCard key={img.id} image={img} categories={categories} />
        ))}
      </div>
    </div>
  )
}
