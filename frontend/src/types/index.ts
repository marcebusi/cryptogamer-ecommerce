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
  icon?: string
}

export type BadgeColor = 'primary' | 'secondary' | 'tertiary'
