import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero'
import PhotoMarquee from '../components/PhotoMarquee'
import { useGallery } from '../lib/useGallery'

export default function Gallery() {
  const images = useGallery()
  const [open, setOpen] = useState(null) // index of the photo shown full screen

  useEffect(() => {
    if (open === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, images.length])

  return (
    <>
      <PageHero eyebrow="Gallery" eyebrowClass="text-red" title="A taste of what we make" subtitle="Parfait, small chops, salads, smoothies and more — fresh from our kitchen." photoIndex={2} />

      <section className="py-10">
        <PhotoMarquee images={images} height="h-40 sm:h-48" />
      </section>

      <div className="container-page columns-1 gap-4 pb-16 sm:columns-2 lg:columns-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setOpen(i)}
            className="group relative mb-4 block w-full animate-fadein overflow-hidden rounded-2xl shadow-sm [break-inside:avoid]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <img src={img.image_url} alt={img.caption ?? ''} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {open !== null && images[open] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={images[open].image_url} alt={images[open].caption ?? ''} className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">✕</button>
          {images[open].caption && <p className="absolute bottom-6 text-sm font-semibold text-white">{images[open].caption}</p>}
        </div>
      )}
    </>
  )
}
