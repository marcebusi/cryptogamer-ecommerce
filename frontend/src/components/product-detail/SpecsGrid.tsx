import type { ProductSpec } from '../../types'
import { useTheme } from '../../context/ThemeContext'

interface SpecsGridProps {
  specs: ProductSpec[]
}

export default function SpecsGrid({ specs }: SpecsGridProps) {
  const { isDark } = useTheme()
  return (
    <div className="mt-md grid grid-cols-2 gap-xs">
      {specs.map(spec => (
        <div
          key={spec.label}
          className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex items-start space-x-3"
        >
          <span
            className="material-symbols-outlined flex-shrink-0"
            style={{
              color: isDark
                ? (spec.color ?? '#94a3b8')
                : '#6b7280',  /* neutral gray in light mode — no red, no neon */
            }}
          >
            {spec.icon}
          </span>
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold mb-0.5">{spec.label}</p>
            <p className="text-sm font-bold text-on-surface">{spec.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
