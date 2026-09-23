export default function Stars({ value, size = 'h-4 w-4', onChange }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <svg viewBox="0 0 20 20" className={`${size} ${n <= Math.round(value) ? 'text-yellow' : 'text-ink/15'}`} fill="currentColor" aria-hidden="true">
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
          </svg>
        )
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} className="transition hover:scale-110">
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        )
      })}
    </span>
  )
}
