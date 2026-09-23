import { Link } from 'react-router-dom'
import HeroSlideshow from '../components/HeroSlideshow'
import PhotoMarquee from '../components/PhotoMarquee'
import ProductCard from '../components/ProductCard'
import SectionTitle from '../components/SectionTitle'
import Stars from '../components/Stars'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { useAuth } from '../context/AuthContext'
import { accent } from '../lib/accents'
import { useCatalog } from '../lib/useCatalog'
import { useGallery } from '../lib/useGallery'
import { useReviews } from '../lib/useReviews'
import { whatsappLink } from '../lib/whatsapp'

const HIGHLIGHTS = [
  { icon: '🌿', title: 'Made fresh daily', text: 'Prepared every morning — never yesterday’s batch.', color: 'bg-green-light text-green' },
  { icon: '🥤', title: 'Snacks, parfait & drinks', text: 'From small chops to smoothies, all in one place.', color: 'bg-orange-light text-orange' },
  { icon: '💬', title: 'Order on WhatsApp', text: 'Send a message and pick up when it’s ready.', color: 'bg-red-light text-red' },
]

export default function Home() {
  const { settings } = useAuth()
  const { categories, products } = useCatalog()
  const gallery = useGallery()
  const { reviews, average } = useReviews()
  const orderLink = whatsappLink(settings, 'Hello, I would like to place an order.')

  const featured = products.filter((p) => p.is_featured)
  const withPhotos = products.filter((p) => p.image_url)
  const showcase = (featured.length ? featured : withPhotos.length ? withPhotos : products).slice(0, 6)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-green/10 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-14 md:grid-cols-2 md:py-20">
          <div className="animate-fadein">
            <span className="badge bg-white px-4 py-1.5 text-ink shadow-sm">
              <span className="mr-2 flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red" /><span className="h-2 w-2 rounded-full bg-green" /><span className="h-2 w-2 rounded-full bg-orange" />
              </span>
              Made fresh daily
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Fresh <span className="text-green">snacks</span>, <span className="text-orange">parfait</span> &amp;{' '}
              <span className="text-red">juice</span> you&apos;ll love.
            </h1>
            <p className="mt-5 max-w-md text-lg">
              {settings?.tagline || 'Freshly made food and drinks, every day.'} Welcome to {settings?.display_name || settings?.business_name}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {orderLink && (
                <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn-accent px-6 py-3 text-base">
                  <WhatsAppIcon /> Order on WhatsApp
                </a>
              )}
              <Link to="/menu" className="btn-outline px-6 py-3 text-base">
                View the menu
              </Link>
            </div>
            {reviews.length > 0 && (
              <div className="mt-6 flex items-center gap-2 text-sm">
                <Stars value={average} />
                <span>
                  <strong className="text-ink">{average.toFixed(1)}</strong> from {reviews.length} customer review{reviews.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="relative animate-fadein [animation-delay:150ms]">
            <HeroSlideshow images={gallery} />
            {settings?.address && (
              <div className="absolute -bottom-5 left-4 right-4 hidden items-center gap-3 rounded-2xl bg-white p-3 text-xs shadow-lg sm:flex md:-left-6 md:right-auto md:max-w-xs">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-light text-base">📍</span>
                <span className="text-ink">{settings.address}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Moving photo strip */}
      <section className="py-8">
        <PhotoMarquee images={gallery} />
      </section>

      {/* Highlights */}
      <section className="container-page grid gap-4 py-10 sm:grid-cols-3">
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className="card flex gap-4 p-5">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${h.color}`}>{h.icon}</span>
            <div>
              <h3 className="font-bold">{h.title}</h3>
              <p className="mt-1 text-sm">{h.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page py-14">
          <SectionTitle center eyebrow="Our menu" eyebrowClass="text-green" title="What we serve" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c, i) => {
              const a = accent(i)
              return (
                <Link key={c.id} to={`/menu#${c.slug}`} className={`card group border-t-4 ${a.top} p-5 text-center transition hover:-translate-y-1 hover:shadow-lg`}>
                  <p className="font-display text-base font-bold text-ink">{c.name}</p>
                  {c.description && <p className="mt-1 text-xs">{c.description}</p>}
                  <span className={`mt-3 inline-block text-xs font-semibold ${a.text}`}>See items →</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured products */}
      {showcase.length > 0 && (
        <section className="bg-cream-dark/60 py-16">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Customer favourites" eyebrowClass="text-red" title="Popular right now" />
              <Link to="/menu" className="mb-10 text-sm font-semibold text-orange hover:underline">Full menu →</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="container-page py-16">
          <SectionTitle center eyebrow="Reviews" eyebrowClass="text-orange" title="What our customers say" />
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.slice(0, 3).map((r, i) => (
              <figure key={r.id} className={`card border-t-4 ${accent(i).top} p-6`}>
                <Stars value={r.rating} />
                <blockquote className="mt-3 text-sm leading-relaxed">“{r.comment}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-ink">— {r.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/reviews" className="btn-outline">Read all reviews</Link>
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-center sm:p-12">
          <div className="absolute inset-x-0 top-0 grid h-1.5 grid-cols-4">
            <span className="bg-red" /><span className="bg-green" /><span className="bg-orange" /><span className="bg-yellow" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Hungry? We&apos;re one message away.</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/75">
            Send your order on WhatsApp and we&apos;ll have it fresh and ready — or stop by and see what&apos;s on today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {orderLink && (
              <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn-accent px-6 py-3">
                <WhatsAppIcon /> Chat on WhatsApp
              </a>
            )}
            <Link to="/contact" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">Find us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
