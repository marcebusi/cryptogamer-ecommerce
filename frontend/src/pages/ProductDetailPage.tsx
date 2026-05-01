import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ImageGallery from '../components/product-detail/ImageGallery'
import ProductInfo from '../components/product-detail/ProductInfo'
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
    image: p.image, images: tryParse<import('../types').ImgSrc[]>(p.images, []),
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
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setProduct(featuredProduct); setLoading(false); return }
    setLoading(true)
    api.get<{ success: boolean; data: ApiProduct }>(`/api/products/${id}`)
      .then(res => setProduct(mapApi(res.data)))
      .catch(() => setProduct(staticMap[id] ?? featuredProduct))
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

  const p = product!
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

      {/* Features section */}
      <section className="mt-xl py-xl border-t border-white/5">
        <h2 className="text-h2-headline font-h2-headline text-on-background mb-lg flex items-center space-x-4">
          <span className="text-purple-500">#</span>
          <span>Hyper-Immersive Tech</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-md items-center">
          <div className="md:col-span-4 bg-surface-container p-md rounded-2xl border border-white/5 shadow-xl relative overflow-hidden min-h-[300px] flex flex-col justify-end">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <img
                alt="Feature visual"
                className="w-full h-full object-cover"
                src={p.image}
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-h3-title font-h3-title text-tertiary-container mb-2">Tecnología Premium</h3>
              <p className="text-on-surface-variant">Diseñado para la máxima experiencia gaming.</p>
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-md">
            {(p.specs && p.specs.length > 0
              ? p.specs.slice(0, 2).map(s => ({
                  icon: s.icon ?? 'star',
                  color: s.color ?? 'text-purple-400',
                  bg: 'bg-purple-500/10 border-purple-500/20',
                  title: s.label,
                  desc: s.value,
                }))
              : [
                  { icon: 'surround_sound', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', title: 'Audio Envolvente', desc: 'Sonido 3D para máxima inmersión.' },
                  { icon: 'speed',          color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20',   title: 'Alto Rendimiento', desc: 'Potencia para los juegos más exigentes.' },
                ]
            ).map(f => (
              <div key={f.title} className="bg-surface-container-low p-md rounded-2xl border border-white/5 flex items-start space-x-4">
                <div className={`p-3 rounded-xl border ${f.bg}`}>
                  <span className={`material-symbols-outlined ${f.color} text-3xl`}>{f.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-on-surface">{f.title}</h4>
                  <p className="text-sm text-on-surface-variant">{f.desc}</p>
                </div>
              </div>
            ))}

            {p.specs && p.specs.length > 2 && (
              <div className="bg-surface-container-low p-md rounded-2xl border border-white/5 sm:col-span-2">
                <div className="flex flex-wrap gap-sm">
                  {p.specs.slice(2).map(s => (
                    <div key={s.label} className="flex items-center gap-xs">
                      <span className={`material-symbols-outlined text-sm ${s.color ?? 'text-primary-container'}`}>{s.icon}</span>
                      <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{s.label}:</span>
                      <span className="text-xs text-on-surface">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      <RelatedProducts />
    </main>
  )
}
