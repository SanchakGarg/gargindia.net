'use client'

import { useState } from 'react'
import type { Image } from '@/lib/types'

function ImageModal({ image, onClose }: { image: Image; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <img
        src={image.url}
        alt={image.filename}
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

export default function ImageGrid({ images }: { images: Image[] }) {
  const [selected, setSelected] = useState<Image | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className="masonry-grid">
        {images.map((img) => (
          <div
            key={img.id}
            className="masonry-item cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            onClick={() => setSelected(img)}
          >
            <img
              src={img.url}
              alt={img.filename}
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      {selected && <ImageModal image={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
