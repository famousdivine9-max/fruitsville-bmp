import ProductImage from '../components/ProductImage'
import { useCatalog } from '../lib/useCatalog'

// Simple grid for now: uploaded product photos, with branded placeholders until
// real photography is added through Admin → Products.
export default function Gallery() {
  const { products } = useCatalog()
  const tiles = products.length ? products : Array.from({ length: 6 }, (_, i) => ({ id: i, name: '' }))

  return (
    <>
      <section className="bg-gradient-to-br from-brand to-brand-dark py-12 text-white">
        <div className="container-page">
          <h1 className="text-4xl font-extrabold uppercase">Gallery</h1>
          <p className="mt-2 text-white/80">A look at what we make every day. More photos coming soon.</p>
        </div>
      </section>
      <div className="container-page grid grid-cols-2 gap-4 py-10 md:grid-cols-3">
        {tiles.map((p) => (
          <figure key={p.id} className="overflow-hidden rounded-2xl">
            <ProductImage product={p} className="aspect-square w-full" />
            {p.name && <figcaption className="mt-2 text-sm font-semibold text-brand">{p.name}</figcaption>}
          </figure>
        ))}
      </div>
    </>
  )
}
