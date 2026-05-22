import type { ProductSpec } from '../../types'
import { useTheme } from '../../context/ThemeContext'

interface SpecsGridProps {
  specs: ProductSpec[]
}

/* Muted-but-visible color mapping for light mode */
function lightColor(hex: string | null | undefined): string {
  if (!hex) return '#4b5563'
  const map: Record<string, string> = {
    '#7c3aed': '#6d28d9', '#a855f7': '#7c3aed',
    '#3af4ff': '#0284c7', '#3af4ff66': '#0284c7',
    '#39ff14': '#15803d', '#ff4a8d': '#be185d',
    '#ff2d6b': '#be185d', '#fbbf24': '#b45309',
    '#60a5fa': '#2563eb', '#4ade80': '#15803d',
  }
  return map[hex] ?? '#4b5563'
}

export default function SpecsGrid({ specs }: SpecsGridProps) {
  const { isDark } = useTheme()

  return (
    <div className="mt-md grid grid-cols-2 gap-3">
      {specs.map(spec => {
        const iconColor = isDark
          ? (spec.color ?? '#94a3b8')
          : lightColor(spec.color)

        const iconBg = isDark
          ? `${spec.color ?? '#94a3b8'}18`
          : `${iconColor}14`

        return (
          <div
            key={spec.label}
            className="bg-surface-container-low rounded-xl p-3 flex items-start gap-3"
            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}
          >
            {/* Icon pill */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: iconBg }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: iconColor }}>
                {spec.icon}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
                style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)' }}>
                {spec.label}
              </p>
              <p className="text-xs font-bold text-on-surface leading-tight">{spec.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
