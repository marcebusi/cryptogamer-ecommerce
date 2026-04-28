import { Link, useParams } from 'react-router-dom'
import ImageGallery from '../components/product-detail/ImageGallery'
import ProductInfo from '../components/product-detail/ProductInfo'
import RelatedProducts from '../components/product-detail/RelatedProducts'
import { featuredProduct, allProducts, latestProducts } from '../data/products'

const allProductsMap = [...allProducts, ...latestProducts, featuredProduct].reduce<
  Record<string, typeof featuredProduct>
>((acc, p) => {
  acc[p.id] = p
  return acc
}, {})

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = id ? (allProductsMap[id] ?? featuredProduct) : featuredProduct

  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-margin py-lg">
      {/* Breadcrumb */}
      <nav className="mb-sm flex items-center space-x-2 text-label-caps text-on-surface-variant">
        <Link to="/" className="hover:text-primary-container transition-colors">
          Home
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to="/products" className="hover:text-primary-container transition-colors">
          Hardware
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-tertiary-fixed-dim">{product.name}</span>
      </nav>

      {/* Product hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <ImageGallery product={product} />
        <ProductInfo product={product} />
      </div>

      {/* Features section */}
      <section className="mt-xl py-xl border-t border-white/5">
        <h2 className="text-h2-headline font-h2-headline text-on-background mb-lg flex items-center space-x-4">
          <span className="text-purple-500">#</span>
          <span>Hyper-Immersive Tech</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-md items-center">
          {/* Large feature card */}
          <div className="md:col-span-4 bg-surface-container p-md rounded-2xl border border-white/5 shadow-xl relative overflow-hidden min-h-[300px] flex flex-col justify-end">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <img
                alt="Haptic Feedback visualization"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBRI9fKBHSmy_6vs9yAhgOwOYuTSJVoodWk05hvjq0MSxUICdgJ2NOvLiSN3StyHndTeBDx2oA68KdC-zKpPXAYN8HqrfsUVregr1DXLWzlbxPV_nlVz3udPZIqo-CZmN3rywlWHeRBceiiS7JOWMk6nUi4865pKTYfL1MgYL7ObKK6EhKiTSrqyQObCRtCcViQ8m5-HxXpXHpu93XCCnU7T77ENBfRCXA8szbgRSq8sx3fnqvKHAoNqJn7-x0PiPZTcREWk3XZGc"
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-h3-title font-h3-title text-tertiary-container mb-2">
                Haptic Feedback
              </h3>
              <p className="text-on-surface-variant">
                Feel the impact of every action through the DualSense wireless controller.
              </p>
            </div>
          </div>

          {/* Small feature cards */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-md">
            {[
              {
                icon: 'surround_sound',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/20',
                title: 'Tempest 3D AudioTech',
                desc: 'Immerse yourself in soundscapes where it feels as if the sound comes from every direction.',
              },
              {
                icon: 'joystick',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10 border-cyan-500/20',
                title: 'Adaptive Triggers',
                desc: 'Experience varying levels of force and tension as you interact with your in-game gear.',
              },
            ].map(f => (
              <div
                key={f.title}
                className="bg-surface-container-low p-md rounded-2xl border border-white/5 flex items-start space-x-4"
              >
                <div className={`p-3 rounded-xl border ${f.bg}`}>
                  <span className={`material-symbols-outlined ${f.color} text-3xl`}>{f.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-on-surface">{f.title}</h4>
                  <p className="text-sm text-on-surface-variant">{f.desc}</p>
                </div>
              </div>
            ))}

            {/* Wide card */}
            <div className="bg-surface-container-low p-md rounded-2xl border border-white/5 sm:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-xl text-on-surface">Ray Tracing Support</h4>
                <span className="text-primary-container text-label-caps text-label-caps">
                  LUMINOUS GRAPHICS
                </span>
              </div>
              <p className="text-on-surface-variant">
                Immerse yourself in worlds with a new level of realism as rays of light are individually
                simulated, creating true-to-life shadows and reflections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      <RelatedProducts />
    </main>
  )
}
