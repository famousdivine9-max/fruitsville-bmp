import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../lib/useCatalog'
import { whatsappLink } from '../lib/whatsapp'

// Placeholder panels where real product photography will go (photos pending).
function PhotoPanel({ label, className = '' }) {
  return (
    <div
      className={`flex items-end rounded-3xl border-2 border-dashed border-white/30 bg-white/10 p-4 backdrop-blur-sm ${className}`}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Photo coming soon</p>
        <p className="font-display text-lg font-bold text-white">{label}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { settings } = useAuth()
  const { categories, products } = useCatalog()
  const orderLink = whatsappLink(settings, 'Hello, I would like to place an order.')

  const featured = products.filter((p) => p.is_featured)
  const showcase = (featured.length ? featured : products).slice(0, 6)
  const panelLabels = (featured.length ? featured : products).slice(0, 3).map((p) => p.name)
  while (panelLabels.length < 3) panelLabels.push('Our specials')

  return (
    <>
      {/* Hero — brand gradient, red accent badge/CTA, photo panels */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-green/20 blur-3xl" />

        <div className="container-page relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge bg-green px-4 py-1 text-xs uppercase tracking-widest text-white">
              Today&apos;s specials · Made fresh daily
            </span>
            <h1 className="mt-5 text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {settings?.display_name || settings?.business_name}
            </h1>
            {settings?.tagline && <p className="mt-4 max-w-md text-lg text-white/85">{settings.tagline}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              {orderLink && (
                <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn-accent px-6 py-3 text-base">
                  <WhatsAppIcon /> Order on WhatsApp
                </a>
              )}
              <Link to="/menu" className="btn border border-white/40 px-6 py-3 text-base text-white hover:bg-white/10">
                See the menu
              </Link>
            </div>
            {settings?.address && <p className="mt-6 text-sm text-white/70">📍 {settings.address}</p>}
          </div>

          <div className="grid h-80 grid-cols-2 grid-rows-2 gap-4 sm:h-96">
            <PhotoPanel label={panelLabels[0]} className="row-span-2" />
            <PhotoPanel label={panelLabels[1]} />
            <PhotoPanel label={panelLabels[2]} />
          </div>
        </div>
      </section>

      {/* Categories — red "Our services"-style banner */}
      {categories.length > 0 && (
        <section className="container-page py-14">
          <div className="mb-8 flex justify-center">
            <h2 className="rounded-full bg-red px-6 py-2 text-sm font-bold uppercase tracking-widest text-white">
              What we serve
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/menu#${c.slug}`}
                className="card group p-5 text-center transition hover:-translate-y-0.5 hover:border-brand/40"
              >
                <p className="font-display text-base font-bold text-brand group-hover:text-red">{c.name}</p>
                {c.description && <p className="mt-1 text-xs text-gray-500">{c.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {showcase.length > 0 && (
        <section className="bg-brand-light/60 py-14">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold text-brand sm:text-3xl">
                {featured.length ? 'Customer favourites' : 'From our menu'}
              </h2>
              <Link to="/menu" className="text-sm font-semibold text-red hover:underline">
                Full menu →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <div className="card flex flex-col items-center gap-4 bg-green-light/60 p-8 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold text-green-dark">Hungry? We&apos;re a message away.</h2>
            <p className="mt-1 text-sm text-gray-600">
              Send your order on WhatsApp and pick it up fresh, or stop by and see what&apos;s ready today.
            </p>
          </div>
          {orderLink && (
            <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn-accent shrink-0">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          )}
        </div>
      </section>
    </>
  )
}
