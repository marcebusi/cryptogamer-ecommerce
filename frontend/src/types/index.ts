/* ── Auth ──────────────────────────────────────────── */
export type UserRole = 'CUSTOMER' | 'ADMIN'

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

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
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
