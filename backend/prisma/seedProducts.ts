import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PRODUCTS = [
  // ── CONSOLAS ──────────────────────────────────────────
  {
    cat: 'consoles', name: 'PlayStation 5 Digital Edition', slug: 'ps5-digital',
    price: 399.99, originalPrice: 449.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbQmuTY6d3aFthRRoRfFNUxqdXdEByIZwUZ5nCUoHOoyJ1ri5gbe9h-mHYrOvmDHKW1Jp2xc4X7JWKgGdi2-U62oryGCK3gVDLZgweKlS4HBg1S0xswyWBh5wjBAC11FlaKMEseLrLFoMaSCuQRoWlRHLzvcJW-_QDHNjnxPFRjmWMtzAPEEmUW24DtSHTcECl6cK44lrnbdCDhkZtI3ENF92Yc3DADs4zR2fZ_ba2VvjupJwb3xfoPFzGgc1m0omBRnMVxLxzrsY',
    badge: 'PRE-OWNED', badgeColor: 'secondary', rating: 4.8, reviewCount: 324,
    description: 'Lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
    condition: 'excellent', conditionScore: 85,
    conditionDescription: 'Inspeccionada y certificada. Desgaste cosmético mínimo. Incluye mando DualSense, cable HDMI y cable de alimentación.',
    conditionTags: ['Limpiado', 'Probado', 'Actualizado'],
    sortOrder: 0, isOffer: true, isFeatured: true,
    specs: [
      { icon: 'memory', label: 'PROCESSOR', value: 'AMD Ryzen Zen 2', color: 'text-purple-400' },
      { icon: 'bolt', label: 'GRAPHICS', value: '10.3 TFLOPS RDNA 2', color: 'text-cyan-400' },
      { icon: 'speed', label: 'SSD STORAGE', value: '825GB Custom NVMe', color: 'text-primary-container' },
      { icon: 'videocam', label: 'VIDEO OUT', value: 'Support for 4K 120Hz', color: 'text-yellow-400' },
    ],
  },
  {
    cat: 'consoles', name: 'Xbox Series X — Carbon Black', slug: 'xbox-series-x',
    price: 559.0, originalPrice: 599.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAleQLDCs7vR7gBQK7f3BdwpRFVqnNl_hMrYEOF79qWovdJZUPmTIa8NgBy_QbWwfr5MfFKRRzphtWhts8gmVUAzDheSaKd9fS5pqJi9JPKrc8GFqIP9cKCEfiRqRevT2ZG_-AHUBE1qNbODZH2o0jAC703adMJHQeRwW2b2M1p3d5d22GwomLghJ3EOV8ABeFtYYcyJLIEZnC1n7zCvWgv1mAS5itwkb0MaYlyrXz4SeGeIpvw8J0CLHXPjdUmGZH11SpIZ99ELJM',
    badge: 'OFERTA', badgeColor: 'secondary', rating: 5, reviewCount: 89,
    description: 'La consola más potente de Xbox con 12 teraflops de GPU y SSD de alta velocidad. Retrocompatibilidad con miles de juegos.',
    sortOrder: 1, isOffer: true, isFeatured: true,
    specs: [
      { icon: 'memory', label: 'GPU', value: '12 Teraflops RDNA 2', color: 'text-green-400' },
      { icon: 'speed', label: 'SSD', value: '1TB NVMe Custom', color: 'text-cyan-400' },
      { icon: 'videocam', label: 'VIDEO', value: '4K 120fps / 8K Ready', color: 'text-yellow-400' },
    ],
  },
  {
    cat: 'consoles', name: 'Nintendo Switch OLED — White', slug: 'nintendo-switch-oled',
    price: 349.0, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBRI9fKBHSmy_6vs9yAhgOwOYuTSJVoodWk05hvjq0MSxUICdgJ2NOvLiSN3StyHndTeBDx2oA68KdC-zKpPXAYN8HqrfsUVregr1DXLWzlbxPV_nlVz3udPZIqo-CZmN3rywlWHeRBceiiS7JOWMk6nUi4865pKTYfL1MgYL7ObKK6EhKiTSrqyQObCRtCcViQ8m5-HxXpXHpu93XCCnU7T77ENBfRCXA8szbgRSq8sx3fnqvKHAoNqJn7-x0PiPZTcREWk3XZGc',
    badge: null, badgeColor: 'primary', rating: 5, reviewCount: 210,
    description: 'Pantalla OLED de 7 pulgadas, mayor almacenamiento interno y base mejorada con puerto LAN integrado.',
    sortOrder: 2, isOffer: false, isFeatured: true,
    specs: [
      { icon: 'tv', label: 'PANTALLA', value: '7" OLED Multi-Touch', color: 'text-purple-400' },
      { icon: 'storage', label: 'ALMACEN.', value: '64GB interno + microSD', color: 'text-cyan-400' },
    ],
  },
  // ── ACCESORIOS ────────────────────────────────────────
  {
    cat: 'accessories', name: 'DualSense™ — Midnight Black', slug: 'dualsense-midnight-black',
    price: 69.99, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByWnfPSwrmOF4u199MkQo9AFYfRW_n42xNQSU4Ip03cO06um1m7xccjgnbHuOg6axKcJjGgoOaYo4IFDk3G9ZzYxgaCQlzjb7QHsbrzkpRpV9uJszU7KQj05klGyBzkBWGLQO8cze-njZKptbxa6YQxNYbp6ceUNnDdNZOpBB9hdW9kbTWiXQraRYGYuacaibZwRrbX2-coIeECg_uSwqqP833aNOUOU2sQfpnGjrmT60Zy-LWM37M-Ap5CjoWGfmC9690WKzSbps',
    badge: 'HOT', badgeColor: 'primary', rating: 5, reviewCount: 156,
    description: 'Control inalámbrico DualSense para PS5 en color Midnight Black. Gatillos adaptativos y vibración háptica.',
    sortOrder: 0, isOffer: false, isFeatured: true,
  },
  {
    cat: 'accessories', name: 'PULSE 3D™ Wireless Headset', slug: 'pulse-3d-headset',
    price: 99.99, originalPrice: 119.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2qY37DDrQHMAAouqM0NUMslfTML0gOO-bCVanKGLvxuQTPhLetPB6EBhtvSV4ITzZ3fa5Hj1ClDTVcISrjyLG84sBfiO_6Ml7AKod_QC-uBI0_uYvewEWPoGjDVFMkYeMdvwi4Lb_WqbbRpBHhFyshAWIxUXsQ-sB1crdjUVp70GzGkA1RwZ7nqKOIQumFv_URJIhn2HvFjkwceZm9UH86utgVv8eHdF5ceZ5FXWcdGhFM4lurhg_uB5kHY4vJa0dh6y-UBr1hbI',
    badge: 'OFERTA', badgeColor: 'secondary', rating: 4.7, reviewCount: 88,
    description: 'Headset inalámbrico optimizado para el Audio 3D de PS5. Micrófonos duales integrados.',
    sortOrder: 1, isOffer: true, isFeatured: false,
  },
  {
    cat: 'accessories', name: 'Neon Night Limited Controller', slug: 'neon-night-controller',
    price: 79.0, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChQHoKJNJcANh2acAG9-yCbZeqXsY4EUhiXB7NJcoHPUOy_32l8An0CZ7jIWGreZS9SgwV423u1JmZN-JS9rTNlU2ziwo9Twbsh4JuUOvG9dSy6FZH8FnQylTPyCGGmedmEhG-F9HJcXVTv5XQd2R7SFBsk6FKbO6W1CEk6MArVCGNFKAIiW3wloSID7SoCilfJI-ioXa_zoHdGyLikArfQO6QRt0yN1mWGm5P-pHeTZ4eZfjnvCsJ4h_O0i58xmCYuiGNWIATAXc',
    badge: 'HOT', badgeColor: 'primary', rating: 5, reviewCount: 42,
    description: 'Control edición limitada con iluminación Neon RGB. Compatible con PS5 y PC.',
    sortOrder: 2, isOffer: false, isFeatured: false,
  },
  {
    cat: 'accessories', name: 'Neo-Vortex Mech Keyboard', slug: 'neo-vortex-mech-keyboard',
    price: 189.0, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtZ4CQaCdtQ9t9jXf2IBcYgjnFPS9MYOzzRzll6nmj2665VUU5dKaoP98FEFiMHEazKPhX2J2oBb6OUHjfU9X8Uvcr4uKRzs4EYKof751DdNhCaO89w7QQXr5c933PmNsef54mhvRnh4VIVgqxpE2Ux0MFDRuqt_FCX_vPt99KKWkd8TxMS7mnf4RG4Z7vlyAxXeiCJq43tMm2OH9jUvb3g79rVBULvRNp18STpLKczkgvKnDN6jo1HcUrb5hzzJviBwEWPPNs6dU',
    badge: 'NEW', badgeColor: 'secondary', rating: 4.5, reviewCount: 33,
    description: 'Teclado mecánico gaming inalámbrico con retroiluminación RGB azul. Switches táctiles premium.',
    sortOrder: 3, isOffer: false, isFeatured: true,
  },
  {
    cat: 'accessories', name: 'Shadow Blade Mouse', slug: 'shadow-blade-mouse',
    price: 89.0, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANwgbSXUiXlCht-wa3xxajTdq5OIXvYV0knpiySnl5IjRFaotB58Fa8KY7uO6fnPBg2HofC47caiKKibXxPenceEr1x41tIN6wYkcBnvHwyhSFYTNO6F6Zenu4YxiqLptthgRlsol2VVlnP7AIRdtWlNvlNqSIuhvKJwzyumfQsuWvhn4Jyj0hKMpUlz4mOtU3WWAE29-ZgnaXcEQUYt1vUsCdLJICmxhGuUdh48Ha-UiT1UNoed7mY',
    badge: null, badgeColor: 'primary', rating: 4.2, reviewCount: 67,
    description: 'Mouse gaming con sensor óptico de 25,000 DPI. Sistema de peso ajustable para balance perfecto.',
    sortOrder: 4, isOffer: false, isFeatured: false,
  },
  // ── JUEGOS ────────────────────────────────────────────
  {
    cat: 'games', name: 'God of War Ragnarök', slug: 'god-of-war-ragnarok',
    price: 69.99, originalPrice: 79.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmjcYr1Q3Z6ano5oNXPNFasSqr6HOc04FpdUQ_F-r2xmpaZ4XKFg1KXUXlAcDzXzdm0FwMolFdMIpCEd47UZ5Ve9DKHha1IG5ft84x2vFEYr7zncXmEgL2CDiWgHdJI4X926Ul2-O1SJCxpmP1BNoOXHDrniywSGmLVoXiuhuwcFsbbB1nWS5Tr7ioxWCL0h78DLv2a9OsN5RzmCzWTKoLXEb2ZvXMbLL2WWx67im61pIH74ZBtP5yc0vn7muqRIWnostPXdP8tz8',
    badge: 'OFERTA', badgeColor: 'secondary', rating: 5, reviewCount: 512,
    description: 'Embárcate en un épico viaje por los nueve reinos nórdicos con Kratos y Atreus.',
    sortOrder: 0, isOffer: true, isFeatured: false,
  },
  {
    cat: 'games', name: 'Forza Horizon 5', slug: 'forza-horizon-5',
    price: 59.99, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyssUaJU9TLkQVajdngVVNaPzTX960L2YHgf8T5P0xSKcxHeHBOlfzys-IEK7QARnWuEA6xbHhT_AWgIpEqhZuchcYldyvknY9DxtI145rIVIfWccHqp1yF-ozWvW5Df4bsxtw25c2RczVlqeuJDOq2PHIGW2rzGgC4_0yzi5jkOUIb3VIxjib8CWo7FQaYyeDyRSSX-YV9pclDxF-oUCnlpTz7EM-TZro6O4YPbZ-Q8aA3b-Fu8dVyAig2HKTpd-2AfSMOa2bFm4',
    badge: null, badgeColor: 'primary', rating: 5, reviewCount: 203,
    description: 'El festival de automoción más espectacular de México con más de 500 autos licenciados.',
    sortOrder: 1, isOffer: false, isFeatured: false,
  },
  {
    cat: 'games', name: 'Zelda: Tears of the Kingdom', slug: 'zelda-totk',
    price: 64.99, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3Iv1bo7swsSXRJ6Kk5x-ZugVpcyGek09ulo9wVQcQxM1PY3iHoE4E7TkU7Zm9EfFmRq63Tz7lr6Ihq0yDmE_XarU-gZPYnOP0UGolane2iO9ZRFJjmgyjDugTldhNu9TMyXtVhr6Kh4Nj2lD1iFvMXU3WN4dJOdklTTmlTHmw3BvErFc3WXQKnty7lgTNqwpMw8kYoiCaIX1Qf9C3irn8azRcHrADo3e3WdMK8EYxRQ9YKjxzrNHVga4vcvM8wxQkjLAnXooCzIc',
    badge: 'HOT', badgeColor: 'primary', rating: 5, reviewCount: 445,
    description: 'Explora el reino de Hyrule y los cielos sobre él. La aventura más épica de Nintendo.',
    sortOrder: 2, isOffer: false, isFeatured: true,
  },
  // ── AUDIO ────────────────────────────────────────────
  {
    cat: 'audio', name: 'Sonic-Link Spatial Headset', slug: 'sonic-link-spatial',
    price: 299.0, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2IakxvZeOxtrQrTJa4PN12VsSyuTvLWe9LTc7G4YNfMX66T7RrPfjgnxuAlbIcJeSw4K3f2olqtg8cZEIwDH2f_AbncpUzUVLXmR5ZlnnVHfmvackxRJddkmcI7z32yPLy8HBhBcN2WtsAU6TNsT6D64zOTUqCgjr6dlgIchuwnjB1_FgqDjAqjrfuWZz3PBTWA7fIkPagVC6uXkV14PhvE76UEBq43Kw79dMNsycM0jpxj0ZNF2RprL7hnZjegr81SguybxQb4s',
    badge: null, badgeColor: 'tertiary', rating: 4.3, reviewCount: 55,
    description: 'Headset gaming premium con audio espacial y cancelación activa de ruido. 40 horas de batería.',
    sortOrder: 0, isOffer: false, isFeatured: false,
  },
  {
    cat: 'audio', name: 'Void Audio X Pro', slug: 'void-audio-x-pro',
    price: 249.0, originalPrice: 299.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNSYxOJ_bIZDcQGuLAWWZskAvDO4CXpZB_cnC4v49qFnnB8zSBYlNc0r4lV_EWFWSnnyuKEKhdGoiwjamumpJWbMvglhKzpTrSIoCA4xZNFi6ydx6vhVWk1V3Eszpow4QorIN1q29v2sWloPdr0-KeIUr8mxR3hs79Jlzsx0bf2Go1BIrihFM87Vg8-rpvwPRv0yXamAG-i-UTsI8C52OCRcqeh3PuKpcAfEcq5UsHdtskeULJICmxhGuUdh48Ha-UiT1UNoed7mY',
    badge: 'OFERTA', badgeColor: 'secondary', rating: 4.6, reviewCount: 78,
    description: 'Audio inmersivo espacial con cancelación activa de ruido y 40 horas de batería para largas sesiones.',
    sortOrder: 1, isOffer: true, isFeatured: false,
  },
  // ── MÓVILES ──────────────────────────────────────────
  {
    cat: 'mobile', name: 'Retro Pocket Z', slug: 'retro-pocket-z',
    price: 129.0, originalPrice: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzhN9SrXa_MMvvznZDjLpWY3T4FnH_C8r2oX7f2oJv5zuhun-lqF9baxcFHFr7OzsnLVQ3WlPEh0uzZX2gJKLZsEd5wJVJtMBgMRfX3ZvhxZFawF9NU0vRSm_oEJcdJDMMoPAyp6zYCniTryh14nN5HEGslbGCTIitKsXaOk2G3FIdJ5KIgwNgvg-0Gs-9VkLLTzvTiT-5GehrFbmriIzV6VgDKzXomzWYiIf6HabjDGneAOGzVfEG_jZC95J6rawRfPDnV3z0BHs',
    badge: 'RETRO', badgeColor: 'secondary', rating: 4.0, reviewCount: 29,
    description: 'Gaming retro en formato handheld. Upscaling 4K para títulos clásicos con pantalla OLED moderna.',
    sortOrder: 0, isOffer: false, isFeatured: false,
  },
  // ── PERFUMES ─────────────────────────────────────────
  {
    cat: 'perfumes', name: 'Cyber Noir EDP 100ml', slug: 'cyber-noir-edp',
    price: 89.0, originalPrice: 119.0,
    image: 'https://placehold.co/600x600/111318/39ff14?text=Cyber+Noir',
    badge: 'OFERTA', badgeColor: 'secondary', rating: 4.4, reviewCount: 18,
    description: 'Fragancia masculina oscura con notas de cedro, bergamota y ámbar. Edición limitada gaming.',
    sortOrder: 0, isOffer: true, isFeatured: false,
  },
  {
    cat: 'perfumes', name: 'Neon Rush EDT 50ml', slug: 'neon-rush-edt',
    price: 65.0, originalPrice: null,
    image: 'https://placehold.co/600x600/111318/ff4a8d?text=Neon+Rush',
    badge: 'NEW', badgeColor: 'primary', rating: 4.2, reviewCount: 11,
    description: 'Fragancia fresca y energética con notas cítricas y musgo blanco. Perfecta para el día a día.',
    sortOrder: 1, isOffer: false, isFeatured: false,
  },
]

async function main() {
  console.log('🌱  Seeding products...')

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.cat } })
    if (!category) { console.warn(`  ⚠️  Cat not found: ${p.cat}`); continue }

    // Check if already exists
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (existing) { console.log(`  ⏭️  Skip: ${p.name}`); continue }

    await prisma.product.create({
      data: {
        name:                p.name,
        slug:                p.slug,
        description:         p.description,
        price:               p.price,
        originalPrice:       p.originalPrice ?? null,
        image:               p.image,
        images:              '[]',
        badge:               p.badge ?? null,
        badgeColor:          p.badgeColor,
        rating:              p.rating,
        reviewCount:         p.reviewCount,
        inStock:             true,
        sortOrder:           p.sortOrder,
        isOffer:             p.isOffer,
        isFeatured:          p.isFeatured,
        condition:           (p as any).condition ?? null,
        conditionScore:      (p as any).conditionScore ?? null,
        conditionDescription:(p as any).conditionDescription ?? null,
        conditionTags:       JSON.stringify((p as any).conditionTags ?? []),
        categoryId:          category.id,
        specs: (p as any).specs?.length
          ? { create: (p as any).specs }
          : undefined,
      },
    })
    console.log(`  ✅  ${p.name}`)
  }

  console.log('🎉  Productos seed completado.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
