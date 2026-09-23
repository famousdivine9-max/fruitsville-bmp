import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'
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
      <section className="bg-gradient-to-br from-brand to-brand-dark py-12 text-white">
        <div className="container-page">
          <h1 className="text-4xl font-extrabold uppercase">Our Menu</h1>
          <p className="mt-2 text-white/80">Made fresh every day. Tap any item to order on WhatsApp.</p>
        </div>
      </section>

      <div className="container-page py-10">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="mb-8 flex flex-wrap gap-2">
              {[{ slug: 'all', name: 'All' }, ...categories].map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setActive(c.slug)}
                  className={`btn btn-sm ${
                    active === c.slug ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-charcoal hover:border-brand'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {visibleCategories.map((c) => {
              const items = products.filter((p) => p.category_id === c.id)
              if (!items.length) return null
              return (
                <section key={c.id} id={c.slug} className="mb-12 scroll-mt-24">
                  <h2 className="mb-1 text-2xl font-extrabold text-brand">{c.name}</h2>
                  {c.description && <p className="mb-5 text-sm text-gray-500">{c.description}</p>}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              )
            })}

            {active === 'all' && uncategorised.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-5 text-2xl font-extrabold text-brand">More</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {uncategorised.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            {!products.length && <p className="py-16 text-center text-gray-500">The menu is being updated — check back soon.</p>}
          </>
        )}
      </div>
    </>
  )
}
