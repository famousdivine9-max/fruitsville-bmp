// Product photo, or a branded placeholder with the product's first letter
// when no image has been uploaded yet.
const PLACEHOLDERS = [
  'bg-brand-light text-brand',
  'bg-green-light text-green',
  'bg-brand text-white',
  'bg-green text-white',
]

export default function ProductImage({ product, className = 'aspect-[4/3] w-full' }) {
  if (product?.image_url) {
    return <img src={product.image_url} alt={product.name} loading="lazy" className={`${className} object-cover`} />
  }
  const name = product?.name || '?'
  const tone = PLACEHOLDERS[name.charCodeAt(0) % PLACEHOLDERS.length]
  return (
    <div className={`${className} ${tone} flex items-center justify-center`} role="img" aria-label={`${name} (no photo yet)`}>
      <span className="font-display text-5xl font-extrabold">{name.charAt(0).toUpperCase()}</span>
    </div>
  )
}
