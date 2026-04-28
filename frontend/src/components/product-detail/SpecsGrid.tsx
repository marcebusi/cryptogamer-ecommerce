import type { ProductSpec } from '../../types'

interface SpecsGridProps {
  specs: ProductSpec[]
}

export default function SpecsGrid({ specs }: SpecsGridProps) {
  return (
    <div className="mt-md grid grid-cols-2 gap-xs">
      {specs.map(spec => (
        <div
          key={spec.label}
          className="bg-surface-container-high/50 p-4 rounded-lg border border-white/5 flex items-start space-x-3"
        >
          <span className={`material-symbols-outlined ${spec.color ?? 'text-on-surface-variant'}`}>
            {spec.icon}
          </span>
          <div>
            <p className="text-label-caps text-on-surface-variant text-[10px]">{spec.label}</p>
            <p className="text-sm font-bold text-on-surface">{spec.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
