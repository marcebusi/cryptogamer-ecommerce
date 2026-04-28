import { useState } from 'react'
import type { Product } from '../../types'
import './ImageGallery.css'

interface ImageGalleryProps {
  product: Product
}

export default function ImageGallery({ product }: ImageGalleryProps) {
  const thumbs = product.images && product.images.length > 0 ? product.images : [product.image]
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="lg:col-span-7 space-y-md">
      {/* Main image — dark studio style */}
      <div className="gallery-main relative rounded-xl overflow-hidden border border-white/5 shadow-2xl group">
        {/* Scanline overlay */}
        <div className="scanline-overlay absolute inset-0 opacity-20 pointer-events-none z-10" />

        {/* Gradient bg behind product */}
        <div className="gallery-bg absolute inset-0" />

        <img
          alt={product.name}
          className="gallery-img relative z-[5] w-full h-full object-contain p-8 md:p-16 transition-transform duration-700 group-hover:scale-105"
          src={thumbs[activeIdx]}
        />

        {/* Condition badge top-left */}
        {product.condition && product.condition !== 'new' && (
          <div className="absolute top-4 left-4 z-20">
            <span className="condition-badge-preowned px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
              Pre-owned
            </span>
          </div>
        )}

        {/* Spec pills bottom-right */}
        <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
          <span className="bg-surface-container-highest/70 backdrop-blur-md px-3 py-1 rounded-full text-label-caps text-[10px] text-on-surface">
            4K HDR
          </span>
          <span className="bg-surface-container-highest/70 backdrop-blur-md px-3 py-1 rounded-full text-label-caps text-[10px] text-on-surface">
            825GB SSD
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-sm">
        {thumbs.slice(0, 3).map((src, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`thumb-btn aspect-square rounded-lg overflow-hidden bg-surface-container-high transition-all cursor-pointer ${
              activeIdx === i
                ? 'border-2 border-purple-500 shadow-[0_0_12px_rgba(138,43,226,0.4)]'
                : 'border border-white/10 hover:border-purple-400/50'
            }`}
          >
            {/* Dark bg for thumbnails */}
            <div className="relative w-full h-full bg-[#0a0a10]">
              <img
                alt={`${product.name} vista ${i + 1}`}
                className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-110"
                src={src}
              />
            </div>
          </button>
        ))}

        {/* +N overflow button */}
        {thumbs.length > 3 ? (
          <button
            onClick={() => setActiveIdx(3)}
            className={`thumb-btn aspect-square rounded-lg overflow-hidden bg-surface-container-high transition-all cursor-pointer ${
              activeIdx >= 3
                ? 'border-2 border-purple-500 shadow-[0_0_12px_rgba(138,43,226,0.4)]'
                : 'border border-white/10 hover:border-purple-400/50'
            }`}
          >
            <div className="relative w-full h-full bg-[#0a0a10]">
              <img
                alt="Más imágenes"
                className="w-full h-full object-contain p-2 blur-[2px] opacity-40"
                src={thumbs[3]}
              />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-on-surface text-lg">
                +{thumbs.length - 3}
              </span>
            </div>
          </button>
        ) : (
          /* Placeholder slot if fewer than 4 thumbs */
          thumbs.length < 4 && (
            <div className="aspect-square rounded-lg border border-white/5 bg-surface-container-low" />
          )
        )}
      </div>
    </div>
  )
}
