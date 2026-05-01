/* ── Auth ──────────────────────────────────────────── */
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN'

export interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  phone?: string | null
  address?: string | null
  createdAt?: string
}

/* ── Products ──────────────────────────────────────── */
export type ProductCondition = 'new' | 'like-new' | 'excellent' | 'good' | 'fair'

/** Image item — supports both legacy string URLs and new object format */
export interface ImageItem {
  url:       string
  position?: string   // CSS object-position, e.g. "50% 20%"
  zoom?:     number   // scale factor, e.g. 1.2
}

export type ImgSrc = string | ImageItem

export const imgUrl = (item: ImgSrc): string =>
  typeof item === 'string' ? item : item.url

export const imgPosition = (item: ImgSrc): string =>
  typeof item === 'string' ? '50% 50%' : (item.position ?? '50% 50%')

export const imgZoom = (item: ImgSrc): number =>
  typeof item === 'string' ? 1 : (item.zoom ?? 1)

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: ImgSrc[]
  category: string
  subcategory?: string
  badge?: string
  badgeColor?: 'primary' | 'secondary' | 'tertiary'
  rating: number
  reviewCount?: number
  description: string
  inStock: boolean
  specs?: ProductSpec[]
  features?: ProductFeature[]
  condition?: ProductCondition
  conditionScore?: number
  conditionDescription?: string
  conditionTags?: string[]
  // CMS fields
  sortOrder?: number
  isOffer?: boolean
  isFeatured?: boolean
  slug?: string
  createdAt?: string
}

export interface ProductSpec {
  icon: string
  label: string
  value: string
  color?: string
}

export interface ProductFeature {
  icon: string
  title: string
  description: string
  variant?: 'primary' | 'secondary' | 'tertiary'
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  children: string   // JSON string: [{id, label, children?: [{id, label}]}]
  sortOrder: number
  _count?: { products: number }
}

export interface CategoryChild {
  id: string
  label: string
  children?: { id: string; label: string }[]
}

export type BadgeColor = 'primary' | 'secondary' | 'tertiary'
