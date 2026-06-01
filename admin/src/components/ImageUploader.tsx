'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { Upload, X, Loader2, ChevronDown, Tag, Plus } from 'lucide-react'
import { uploadImages } from '@/app/actions'
import type { CategoryWithImages } from '@/lib/types'

interface FilePreview {
  file: File
  preview: string
  width: number
  height: number
  compressed?: File
  compressing: boolean
}

type Selection =
  | { type: 'none' }
  | { type: 'existing'; id: string; name: string }
  | { type: 'new'; name: string }

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src) }
    img.src = URL.createObjectURL(file)
  })
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
}

function CategoryCombobox({ categories, value, onChange }: {
  categories: CategoryWithImages[]
  value: Selection
  onChange: (s: Selection) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
  const showCreate = query.trim() && !categories.some(c => c.name.toLowerCase() === query.trim().toLowerCase())

  const label =
    value.type === 'none' ? 'No Category' :
    value.type === 'existing' ? value.name :
    `New: ${value.name}`

  function select(s: Selection) {
    onChange(s)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-left focus:outline-none"
      >
        <span className="flex items-center gap-2 text-gray-700 truncate">
          <Tag size={14} className="shrink-0 text-gray-400" />
          {label}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search or type new category…"
              className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => select({ type: 'none' })}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${value.type === 'none' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                No Category
              </button>
            </li>
            {filtered.map(cat => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => select({ type: 'existing', id: cat.id, name: cat.name })}
                  className={`w-full text-left px-4 py-2.5 text-sm ${value.type === 'existing' && value.id === cat.id ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
            {showCreate && (
              <li>
                <button
                  type="button"
                  onClick={() => select({ type: 'new', name: query.trim() })}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <Plus size={14} />
                  Create &ldquo;{query.trim()}&rdquo;
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ImageUploader({ categories }: { categories: CategoryWithImages[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<Selection>({ type: 'none' })
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const initial: FilePreview[] = arr.map(f => ({
      file: f, preview: URL.createObjectURL(f), width: 0, height: 0, compressing: true,
    }))
    setPreviews(prev => [...prev, ...initial])

    for (const file of arr) {
      const { width, height } = await getImageDimensions(file)
      const compressed = await compressImage(file)
      setPreviews(prev => prev.map(p => p.file === file ? { ...p, width, height, compressed, compressing: false } : p))
    }
  }

  function remove(index: number) {
    setPreviews(prev => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index) })
  }

  async function handleUpload() {
    if (previews.length === 0) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      if (selection.type === 'existing') fd.append('categoryId', selection.id)
      if (selection.type === 'new') fd.append('newCategoryName', selection.name)
      for (const p of previews) {
        fd.append('files', p.compressed ?? p.file, p.file.name)
        fd.append('widths', String(p.width))
        fd.append('heights', String(p.height))
      }
      const result = await uploadImages(fd)
      if (result?.error) {
        setUploadError(result.error)
        return
      }
      setPreviews([])
      router.refresh()
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Unexpected error — check Vercel env vars and Supabase bucket')
    } finally {
      setUploading(false)
    }
  }

  const allReady = previews.length > 0 && previews.every(p => !p.compressing)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Upload Images</h2>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
        <CategoryCombobox categories={categories} value={selection} onChange={setSelection} />
        {selection.type === 'new' && (
          <p className="text-xs text-red-600 mt-1 pl-1">Category &ldquo;{selection.name}&rdquo; will be created on upload</p>
        )}
        {selection.type === 'none' && (
          <p className="text-xs text-gray-400 mt-1 pl-1">Images will appear in the Uncategorized section</p>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-300'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <Upload size={26} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium text-gray-600">Drop images or tap to browse</p>
        <p className="text-xs text-gray-400 mt-1">Auto-compressed before upload</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)} />
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <strong>Upload failed:</strong> {uploadError}
          <p className="text-xs mt-1 text-red-500">Make sure the Supabase schema SQL has been run and the &quot;catalogue&quot; storage bucket exists.</p>
        </div>
      )}

      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {previews.map((p, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                <img src={p.preview} className="w-full h-full object-cover" alt="" />
                {p.compressing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={14} className="text-white animate-spin" />
                  </div>
                )}
                <button
                  onClick={() => remove(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{previews.length} image{previews.length !== 1 ? 's' : ''} selected</p>
            <button
              onClick={handleUpload}
              disabled={uploading || !allReady}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 flex items-center gap-2 transition-opacity"
              style={{ backgroundColor: '#dc2626' }}
            >
              {uploading && <Loader2 size={14} className="animate-spin" />}
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
