// Endless, slowly scrolling strip of photos. The list is rendered twice so the
// CSS animation (translateX 0 → -50%) loops seamlessly. Pauses on hover.
export default function PhotoMarquee({ images, height = 'h-48 sm:h-56' }) {
  if (!images.length) return null
  const loop = [...images, ...images]
  return (
    <div className="group relative overflow-hidden" aria-label="Photo gallery">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent" />
      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        {loop.map((img, i) => (
          <figure key={`${img.id}-${i}`} className={`${height} aspect-[4/3] shrink-0 overflow-hidden rounded-2xl shadow-sm`} aria-hidden={i >= images.length}>
            <img src={img.image_url} alt={img.caption ?? ''} loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
          </figure>
        ))}
      </div>
    </div>
  )
}
