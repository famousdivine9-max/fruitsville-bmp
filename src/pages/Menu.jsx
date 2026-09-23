import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageHero from '../components/PageHero'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'
import { accent } from '../lib/accents'
import { useCatalog } from '../lib/useCatalog'

export default function Menu() {
  const { categories, products, loading } = useCatalog()
  const [active, setActive] = useState('all')
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) setActive(hash.slice(1))
  }, [hash])

  const visibleCategories = categories.filter((c) => active === 'all' || c.slug === active)
  const uncategorised = products.filter((p) => !categories.some((c) => c.id === p.category_id))

  return (
    <>
      <PageHero eyebrow="Our menu" eyebrowClass="text-green" title="Made fresh, every day" subtitle="Tap “Order on WhatsApp” on any item and we’ll get it ready for you." photoIndex={1} />

      <div className="container-page py-12">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="sticky top-16 z-20 -mx-4 mb-10 flex gap-2 overflow-x-auto bg-cream/95 px-4 py-3 backdrop-blur">
              {[{ slug: 'all', name: 'All' }, ...categories].map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setActive(c.slug)}
                  className={`btn btn-sm shrink-0 ${
                    active === c.slug ? 'bg-ink text-white' : 'border border-ink/15 bg-white text-ink hover:border-ink/40'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {visibleCategories.map((c, i) => {
              const items = products.filter((p) => p.category_id === c.id)
              if (!items.length) return null
              const a = accent(categories.indexOf(c))
              return (
                <section key={c.id} id={c.slug} className="mb-14 scroll-mt-32">
                  <div className="mb-6 flex items-center gap-3">
                    <span className={`h-8 w-1.5 rounded-full ${a.bg}`} />
                    <div>
                      <h2 className="text-2xl font-extrabold">{c.name}</h2>
                      {c.description && <p className="text-sm">{c.description}</p>}
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              )
            })}

            {active === 'all' && uncategorised.length > 0 && (
              <section className="mb-14">
                <h2 className="mb-6 text-2xl font-extrabold">More</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {uncategorised.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            {!products.length && <p className="py-16 text-center">The menu is being updated — check back soon.</p>}
          </>
        )}
      </div>
    </>
  )
}
