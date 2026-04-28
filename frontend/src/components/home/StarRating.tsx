interface StarRatingProps {
  rating: number
  maxRating?: number
}

export default function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  return (
    <div className="flex text-tertiary-fixed-dim text-xs">
      {Array.from({ length: maxRating }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}
          aria-hidden="true"
        >
          star
        </span>
      ))}
    </div>
  )
}
