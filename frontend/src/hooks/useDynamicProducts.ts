import { useEffect, useState } from 'react'
import type { Product } from '../types'
import { normalizeImgUrl } from '../types'
import { api } from '../lib/api'
import { catalogProducts } from '../data/products'

/** Shape returned by the backend product endpoint */
interface ApiProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number | null
  image: string
  images: string       // JSON string
  badge?: string | null
  badgeColor: string
  rating: number
  reviewCount: number
  inStock: boolean
  sortOrder: number
  isOffer: boolean
  isFeatured: boolean
  subcategory?: string | null
  condition?: string | null
  conditionScore?: number | null
  conditionDescription?: string | null
  conditionTags: string   // JSON string
  categoryId: string
  category: { id: string; name: string; slug: string }
  specs?: { id: string; icon: string; label: string; value: string; color?: string }[]
  createdAt: string
}

function mapApiProduct(p: ApiProduct): Product {
  return {
    id:               p.id,
    name:             p.name,
    slug:             p.slug,
    price:            p.price,
    originalPrice:    p.originalPrice ?? undefined,
    image:            normalizeImgUrl(p.image),
    images:           tryParse<string[]>(p.images, []),
    category:         p.category?.slug ?? p.categoryId,
    subcategory:      p.subcategory ?? undefined,
    badge:            p.badge ?? undefined,
    badgeColor:       (p.badgeColor as 'primary' | 'secondary' | 'tertiary') ?? 'primary',
    rating:           p.rating,
    reviewCount:      p.reviewCount,
    description:      p.description,
    inStock:          p.inStock,
    condition:        (p.condition as Product['condition']) ?? undefined,
    conditionScore:   p.conditionScore ?? undefined,
    conditionDescription: p.conditionDescription ?? undefined,
    conditionTags:    tryParse<string[]>(p.conditionTags, []),
    specs:            p.specs ?? [],
    sortOrder:        p.sortOrder,
    isOffer:          p.isOffer,
    isFeatured:       p.isFeatured,
    createdAt:        p.createdAt,
  }
}

function tryParse<T>(raw: string | undefined, fallback: T): T {
  try { return raw ? JSON.parse(raw) : fallback } catch { return fallback }
}

interface Options {
  category?: string   // filter by category slug
  isOffer?: boolean
  isFeatured?: boolean
  limit?: number
}

interface Result {
  products: Product[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDynamicProducts(opts: Options = {}): Result {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (opts.category)   params.set('category',   opts.category)
      if (opts.isOffer)    params.set('isOffer',    'true')
      if (opts.isFeatured) params.set('isFeatured', 'true')
      if (opts.limit)      params.set('limit',      String(opts.limit))

      const qs = params.toString()
      const res = await api.get<{ success: boolean; data: ApiProduct[] }>(
        `/api/products${qs ? `?${qs}` : ''}`
      )
      let mapped = res.data.map(mapApiProduct)
      setProducts(mapped)
    } catch {
      // Backend offline — fall back to static data and filter in memory
      let fallback = catalogProducts.slice()
      if (opts.category)   fallback = fallback.filter(p => p.category === opts.category)
      if (opts.isOffer)    fallback = fallback.filter(p => (p as Product & { isOffer?: boolean }).isOffer)
      if (opts.isFeatured) fallback = fallback.filter(p => (p as Product & { isFeatured?: boolean }).isFeatured)
      if (opts.limit)      fallback = fallback.slice(0, opts.limit)
      setProducts(fallback)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [opts.category, opts.isOffer, opts.isFeatured, opts.limit])

  return { products, isLoading, error, refetch: fetchProducts }
}
