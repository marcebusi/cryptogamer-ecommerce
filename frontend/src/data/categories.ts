/* ─────────────────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH for categories / sub-categories.
 *  Add / remove entries here and every component updates automatically.
 * ───────────────────────────────────────────────────────────────────────── */

export interface SubSubCategory {
  id: string
  label: string
}

export interface SubCategory {
  id: string
  label: string
  /** If present, hovering this item shows a third-level flyout */
  children?: SubSubCategory[]
}

export interface CategoryDef {
  id: string       // matches Product.category value
  label: string    // Spanish display label
  icon: string     // Material Symbol name
  children?: SubCategory[]
}

export const navCategories: CategoryDef[] = [
  {
    id: 'consoles',
    label: 'Consolas',
    icon: 'videogame_asset',
    children: [
      { id: 'ps', label: 'PlayStation' },   // first — most sold in Argentina
      { id: 'xbox', label: 'Xbox' },
      { id: 'switch', label: 'Nintendo Switch' },
    ],
  },
  {
    id: 'accessories',
    label: 'Accesorios',
    icon: 'sports_esports',
    children: [
      {
        id: 'joysticks',
        label: 'Joysticks',
        children: [
          { id: 'joysticks-xbox', label: 'Xbox' },
          { id: 'joysticks-ps', label: 'PlayStation' },
          { id: 'joysticks-switch', label: 'Nintendo Switch' },
          { id: 'joysticks-pc', label: 'PC' },
        ],
      },
      { id: 'headsets', label: 'Headsets' },
      { id: 'cables', label: 'Cables y Adaptadores' },
      { id: 'cases', label: 'Fundas y Cases' },
    ],
  },
  {
    id: 'games',
    label: 'Juegos',
    icon: 'stadia_controller',
    children: [
      { id: 'games-ps', label: 'PlayStation' },
      { id: 'games-xbox', label: 'Xbox' },
      { id: 'games-switch', label: 'Nintendo Switch' },
    ],
  },
  {
    id: 'mobile',
    label: 'Móviles',
    icon: 'smartphone',
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: 'headphones',
  },
  {
    id: 'perfumes',
    label: 'Perfumes',
    icon: 'water_drop',
  },
]

/** Flat lookup: categoryId → CategoryDef */
export const categoryById: Record<string, CategoryDef> = Object.fromEntries(
  navCategories.map(c => [c.id, c])
)

/** Spanish label for a category id */
export function categoryLabel(id: string): string {
  return categoryById[id]?.label ?? id
}
