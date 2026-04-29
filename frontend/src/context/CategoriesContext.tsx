import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Category, CategoryChild } from '../types'
import { api } from '../lib/api'
import { navCategories } from '../data/categories'

interface CategoriesContextValue {
  categories: Category[]
  isLoading: boolean
  refetch: () => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextValue>({
  categories: [],
  isLoading:  true,
  refetch:    async () => {},
})

/** Map static navCategories to Category shape for fallback */
function staticFallback(): Category[] {
  return navCategories.map((c, i) => ({
    id:        c.id,
    name:      c.label,
    slug:      c.id,
    icon:      c.icon,
    children:  JSON.stringify(c.children ?? []),
    sortOrder: i,
  }))
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading,  setIsLoading]  = useState(true)

  const fetchCategories = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Category[] }>('/api/categories')
      setCategories(res.data)
    } catch {
      // Backend offline — fall back to static data
      setCategories(staticFallback())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, refetch: fetchCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  return useContext(CategoriesContext)
}

/** Parse the children JSON string safely */
export function parseCategoryChildren(raw: string): CategoryChild[] {
  try { return JSON.parse(raw) } catch { return [] }
}
