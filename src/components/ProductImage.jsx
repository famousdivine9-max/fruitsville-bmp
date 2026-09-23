import { accent } from '../lib/accents'

// Product photo with a slow zoom on hover, or — when no photo has been uploaded
// yet — a soft placeholder with the product's first letter.
export default function ProductImage({ product, className = 'aspect-[4/3] w-full' }) {
  if (product?.image_url) {
    return (
      <div className={`${className} overflow-hidden`}>
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-[1500ms] ease-out group-hover:scale-110"
        />
      </div>
    )
  }
  const name = product?.name || '?'
  const tone = accent(name.charCodeAt(0))
  return (
    <div className={`${className} ${tone.soft} flex items-center justify-center`} role="img" aria-label={`${name} (photo coming soon)`}>
      <span className={`font-display text-5xl font-extrabold ${tone.text}`}>{name.charAt(0).toUpperCase()}</span>
    </div>
  )
}
