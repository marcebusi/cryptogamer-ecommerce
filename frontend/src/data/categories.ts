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
  /** If present, clicking shows a third-level list */
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
      {
        id: 'ps', label: 'PlayStation',
        children: [
          { id: 'ps1', label: 'PlayStation 1' },
          { id: 'ps2', label: 'PlayStation 2' },
          { id: 'ps3', label: 'PlayStation 3' },
          { id: 'ps4', label: 'PlayStation 4' },
          { id: 'ps5', label: 'PlayStation 5' },
        ],
      },
      {
        id: 'xbox', label: 'Xbox',
        children: [
          { id: 'xbox-classic', label: 'Xbox Classic' },
          { id: 'xbox-360',    label: 'Xbox 360' },
          { id: 'xbox-one',    label: 'Xbox One' },
          { id: 'xbox-series', label: 'Xbox Series X/S' },
        ],
      },
      {
        id: 'switch', label: 'Nintendo Switch',
        children: [
          { id: 'switch-og',   label: 'Nintendo Switch' },
          { id: 'switch-lite', label: 'Switch Lite' },
          { id: 'switch-oled', label: 'Switch OLED' },
        ],
      },
      {
        id: 'nintendo-retro', label: 'Nintendo Retro',
        children: [
          { id: 'nes',    label: 'NES / Famicom' },
          { id: 'snes',   label: 'Super Nintendo' },
          { id: 'n64',    label: 'Nintendo 64' },
          { id: 'gamecube', label: 'GameCube' },
          { id: 'wii',    label: 'Wii / Wii U' },
        ],
      },
      { id: 'handheld', label: 'Portátiles' },
    ],
  },
  {
    id: 'accessories',
    label: 'Accesorios',
    icon: 'sports_esports',
    children: [
      {
        id: 'joysticks', label: 'Joysticks / Mandos',
        children: [
          { id: 'joysticks-ps',     label: 'PlayStation' },
          { id: 'joysticks-xbox',   label: 'Xbox' },
          { id: 'joysticks-switch', label: 'Nintendo Switch' },
          { id: 'joysticks-pc',     label: 'PC' },
          { id: 'joysticks-retro',  label: 'Retro' },
        ],
      },
      {
        id: 'headsets', label: 'Headsets',
        children: [
          { id: 'headsets-ps',  label: 'PlayStation' },
          { id: 'headsets-xbox', label: 'Xbox' },
          { id: 'headsets-pc',  label: 'PC / Genérico' },
        ],
      },
      {
        id: 'cases', label: 'Fundas y Cases',
        children: [
          { id: 'cases-ps4',    label: 'PS4' },
          { id: 'cases-ps5',    label: 'PS5' },
          { id: 'cases-xbox',   label: 'Xbox' },
          { id: 'cases-switch', label: 'Nintendo Switch' },
          { id: 'cases-mobile', label: 'Celular' },
        ],
      },
      { id: 'cables',   label: 'Cables y Adaptadores' },
      { id: 'charging', label: 'Cargadores y Baterías' },
      { id: 'stands',   label: 'Soportes y Dock' },
      { id: 'cooling',  label: 'Ventilación y Cooling' },
    ],
  },
  {
    id: 'games',
    label: 'Juegos',
    icon: 'stadia_controller',
    children: [
      {
        id: 'games-ps', label: 'PlayStation',
        children: [
          { id: 'games-ps1', label: 'PlayStation 1' },
          { id: 'games-ps2', label: 'PlayStation 2' },
          { id: 'games-ps3', label: 'PlayStation 3' },
          { id: 'games-ps4', label: 'PlayStation 4' },
          { id: 'games-ps5', label: 'PlayStation 5' },
        ],
      },
      {
        id: 'games-xbox', label: 'Xbox',
        children: [
          { id: 'games-xbox-360',    label: 'Xbox 360' },
          { id: 'games-xbox-one',    label: 'Xbox One' },
          { id: 'games-xbox-series', label: 'Xbox Series' },
        ],
      },
      {
        id: 'games-switch', label: 'Nintendo Switch',
        children: [
          { id: 'games-switch-fisico',  label: 'Físicos' },
          { id: 'games-switch-digital', label: 'Digitales' },
        ],
      },
      {
        id: 'games-retro', label: 'Retro',
        children: [
          { id: 'games-nes',  label: 'NES / Famicom' },
          { id: 'games-snes', label: 'Super Nintendo' },
          { id: 'games-n64',  label: 'Nintendo 64' },
        ],
      },
      { id: 'games-pc', label: 'PC / Steam' },
    ],
  },
  {
    id: 'mobile',
    label: 'Móviles',
    icon: 'smartphone',
    children: [
      { id: 'mobile-phones',      label: 'Teléfonos' },
      { id: 'mobile-tablets',     label: 'Tablets' },
      { id: 'mobile-accessories', label: 'Accesorios Móvil' },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: 'headphones',
    children: [
      { id: 'audio-earbuds',  label: 'Auriculares In-Ear' },
      { id: 'audio-over-ear', label: 'Auriculares Over-Ear' },
      { id: 'audio-speakers', label: 'Parlantes' },
    ],
  },
  {
    id: 'perfumes',
    label: 'Perfumes',
    icon: 'water_drop',
    children: [
      { id: 'perfumes-hombre', label: 'Hombre' },
      { id: 'perfumes-mujer',  label: 'Mujer' },
      { id: 'perfumes-unisex', label: 'Unisex' },
    ],
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
