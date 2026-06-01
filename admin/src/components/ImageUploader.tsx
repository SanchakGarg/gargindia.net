'use client'

import { useState, useRef, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { Upload, X, Plus, Loader2 } from 'lucide-react'
import { uploadImages, createCategory } from '@/app/actions'
import type { CategoryWithImages } from '@/lib/types'

interface FilePreview {
  file: File
  preview: string
  width: number
  height: number
  compressed?: File
  compressing: boolean
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  })
}

const newCatState = { error: '' }

export default function ImageUploader({ categories }: { categories: CategoryWithImages[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? '')
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatState, formAction, newCatPending] = useActionState(createCategory, { error: '' })

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const initial: FilePreview[] = arr.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      width: 0,
      height: 0,
      compressing: true,
    }))
    setPreviews((prev) => [...prev, ...initial])

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]
      const { width, height } = await getImageDimensions(file)
      const compressed = await compressImage(file)
      setPreviews((prev) =>
        prev.map((p) =>
          p.file === file ? { ...p, width, height, compressed, compressing: false } : p
        )
      )
    }
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleUpload() {
    if (!selectedCategoryId || previews.length === 0) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('categoryId', selectedCategoryId)
      for (const p of previews) {
        const fileToUpload = p.compressed ?? p.file
        fd.append('files', fileToUpload, p.file.name)
        fd.append('widths', String(p.width))
        fd.append('heights', String(p.height))
      }
      await uploadImages(fd)
      setPreviews([])
      router.refresh()
    } finally {
      setUploading(false)
    }
  }

  const allCompressed = previews.every((p) => !p.compressing)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Upload Images</h2>
        <button
          onClick={() => setShowNewCat(!showNewCat)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          New Category
        </button>
      </div>

      {showNewCat && (
        <form action={async (fd) => { await formAction(fd); setShowNewCat(false); router.refresh() }} className="flex gap-2">
          <input
            name="name"
            placeholder="Category name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={newCatPending}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-60"
            style={{ backgroundColor: '#dc2626' }}
          >
            {newCatPending ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}
      {newCatState.error && <p className="text-sm text-red-600">{newCatState.error}</p>}

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 shrink-0">Assign to:</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <Upload size={28} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 font-medium">Drop images here or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">Auto-compressed to ~1MB before upload</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {previews.map((p, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                <img src={p.preview} className="w-full h-full object-cover" alt="" />
                {p.compressing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={16} className="text-white animate-spin" />
                  </div>
                )}
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">{previews.length} image{previews.length > 1 ? 's' : ''} selected</p>
            <button
              onClick={handleUpload}
              disabled={uploading || !allCompressed || !selectedCategoryId}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition-opacity flex items-center gap-2"
              style={{ backgroundColor: '#dc2626' }}
            >
              {uploading && <Loader2 size={14} className="animate-spin" />}
              {uploading ? 'Uploading…' : 'Upload All'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
