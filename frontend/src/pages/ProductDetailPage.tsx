import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { normalizeImgUrl } from '../types'
import { useThemeColors } from '../lib/themeColors'
import ImageGallery from '../components/product-detail/ImageGallery'
import ProductInfo from '../components/product-detail/ProductInfo'
import SpecsGrid from '../components/product-detail/SpecsGrid'
import RelatedProducts from '../components/product-detail/RelatedProducts'
import { featuredProduct, allProducts, latestProducts } from '../data/products'
import { navCategories } from '../data/categories'
import { api } from '../lib/api'
import type { Product } from '../types'

/* Static fallback map */
const staticMap = [...allProducts, ...latestProducts, featuredProduct].reduce<
  Record<string, Product>
>((acc, p) => { acc[p.id] = p; return acc }, {})

interface ApiProduct {
  id: string; name: string; slug: string; description: string
  price: number; originalPrice?: number | null
  image: string; images: string; badge?: string | null
  badgeColor: string; rating: number; reviewCount: number
  inStock: boolean; sortOrder: number; isOffer: boolean; isFeatured: boolean
  subcategory?: string | null; condition?: string | null
  conditionScore?: number | null; conditionDescription?: string | null
  conditionTags: string; categoryId: string
  category: { id: string; name: string; slug: string }
  specs?: { id: string; icon: string; label: string; value: string; color?: string }[]
  createdAt: string
}

function mapApi(p: ApiProduct): Product {
  const tryParse = <T,>(raw: string | undefined, fb: T): T => {
    try { return raw ? JSON.parse(raw) : fb } catch { return fb }
  }
  return {
    id: p.id, name: p.name, slug: p.slug,
    price: p.price, originalPrice: p.originalPrice ?? undefined,
    image: normalizeImgUrl(p.image), images: tryParse<import('../types').ImgSrc[]>(p.images, []),
    category: p.category?.slug ?? p.categoryId,
    subcategory: p.subcategory ?? undefined,
    badge: p.badge ?? undefined,
    badgeColor: (p.badgeColor as Product['badgeColor']) ?? 'primary',
    rating: p.rating, reviewCount: p.reviewCount,
    description: p.description, inStock: p.inStock,
    condition: (p.condition as Product['condition']) ?? undefined,
    conditionScore: p.conditionScore ?? undefined,
    conditionDescription: p.conditionDescription ?? undefined,
    conditionTags: tryParse<string[]>(p.conditionTags, []),
    specs: p.specs ?? [],
    sortOrder: p.sortOrder, isOffer: p.isOffer, isFeatured: p.isFeatured,
    createdAt: p.createdAt,
  }
}

export default function ProductDetailPage() {
  const tc = useThemeColors()
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); setNotFound(true); return }
    setLoading(true)
    setNotFound(false)
    api.get<{ success: boolean; data: ApiProduct }>(`/api/products/${id}`)
      .then(res => setProduct(mapApi(res.data)))
      .catch(() => {
        const fallback = staticMap[id]
        if (fallback) { setProduct(fallback) } else { setNotFound(true) }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="max-w-screen-2xl mx-auto px-4 md:px-margin py-lg">
        <div className="h-5 w-48 bg-white/5 rounded-full mb-sm animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-7 aspect-square rounded-2xl bg-white/5 animate-pulse" />
          <div className="lg:col-span-5 space-y-md">
            <div className="h-8 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !product) {
    return (
      <main className="max-w-screen-2xl mx-auto px-4 md:px-margin py-xl flex flex-col items-center justify-center text-center gap-md">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20">search_off</span>
        <h2 className="text-2xl font-black text-on-surface font-['Plus_Jakarta_Sans']">Producto no encontrado</h2>
        <p className="text-on-surface-variant text-sm max-w-sm">
          El producto que buscás no existe o fue eliminado. Revisá el catálogo completo.
        </p>
        <Link to="/products" className="mt-sm px-lg py-sm bg-primary-container text-on-primary rounded-xl font-bold text-sm hover:brightness-110 transition-all cursor-pointer">
          Ver catálogo
        </Link>
      </main>
    )
  }

  const p = product
  const catDef = navCategories.find(c => c.id === p.category)
  const catLabel = catDef?.label ?? p.category ?? 'Productos'

  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-margin py-lg">
      {/* Breadcrumb */}
      <nav className="mb-sm flex items-center space-x-2 text-label-caps text-on-surface-variant">
        <Link to="/" className="hover:text-primary-container transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link
          to={`/products?cat=${p.category ?? ''}`}
          className="hover:text-primary-container transition-colors">
          {catLabel}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-tertiary-fixed-dim truncate max-w-[200px]">{p.name}</span>
      </nav>

      {/* Product hero */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-lg items-start">
        <ImageGallery product={p} />
        <ProductInfo product={p} />
      </div>

      {/* Specs section */}
      {p.specs && p.specs.length > 0 && (
        <section className="mt-xl">
          <h2 className="flex items-center gap-2 text-xl font-black text-on-background font-['Plus_Jakarta_Sans'] mb-lg">
            <span className="text-primary-container font-black">#</span>
            Especificaciones
          </h2>
          <SpecsGrid specs={p.specs} />
        </section>
      )}

      {/* Related products */}
      <RelatedProducts />
    </main>
  )
}
