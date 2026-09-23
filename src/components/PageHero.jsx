import { useGallery } from '../lib/useGallery'

// Inner-page header: a food photo behind a dark overlay, so the page opens on
// the food rather than on a block of colour.
export default function PageHero({ eyebrow, eyebrowClass = 'text-orange', title, subtitle, photoIndex = 0 }) {
  const images = useGallery()
  const photo = images.length ? images[photoIndex % images.length] : null
  return (
    <section className="relative overflow-hidden bg-ink">
      {photo && <img src={photo.image_url} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover opacity-40" />}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="container-page relative py-16 sm:py-20">
        {eyebrow && <p className={`eyebrow ${eyebrowClass}`}>{eyebrow}</p>}
        <h1 className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-xl text-white/80">{subtitle}</p>}
      </div>
    </section>
  )
}
