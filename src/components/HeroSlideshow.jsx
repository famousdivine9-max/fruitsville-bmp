import { useEffect, useState } from 'react'

// Cross-fading photo slideshow with a slow Ken Burns zoom on the active slide.
export default function HeroSlideshow({ images, interval = 5000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), interval)
    return () => clearInterval(t)
  }, [images.length, interval])

  if (!images.length) {
    return <div className="aspect-[4/3] w-full rounded-3xl bg-cream-dark" />
  }

  const current = images[index % images.length]
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl">
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.image_url}
          alt={img.caption ?? ''}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? 'animate-kenburns opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {current?.caption && (
        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink shadow">
          {current.caption}
        </span>
      )}
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex(i)}
            aria-label={`Show photo ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  )
}
