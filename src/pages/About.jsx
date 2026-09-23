import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../lib/useCatalog'

export default function About() {
  const { settings } = useAuth()
  const { categories } = useCatalog()

  return (
    <>
      <section className="bg-gradient-to-br from-brand to-brand-dark py-12 text-white">
        <div className="container-page">
          <h1 className="text-4xl font-extrabold uppercase">About {settings?.business_name}</h1>
          {settings?.tagline && <p className="mt-2 text-white/80">{settings.tagline}</p>}
        </div>
      </section>
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-4 text-gray-700 md:col-span-2">
          {settings?.about?.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} className="leading-relaxed">{para}</p>
          ))}
          <Link to="/menu" className="btn-primary mt-4">Browse the menu</Link>
        </div>
        {categories.length > 0 && (
          <aside className="card p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-green">What we make</h2>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red" />
                  {c.name}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </>
  )
}
