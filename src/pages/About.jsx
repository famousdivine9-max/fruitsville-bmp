import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useAuth } from '../context/AuthContext'
import { accent } from '../lib/accents'
import { useCatalog } from '../lib/useCatalog'
import { useGallery } from '../lib/useGallery'

export default function About() {
  const { settings } = useAuth()
  const { categories } = useCatalog()
  const gallery = useGallery()

  return (
    <>
      <PageHero eyebrow="About us" eyebrowClass="text-orange" title={`About ${settings?.business_name ?? ''}`} subtitle={settings?.tagline} photoIndex={4} />
      <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2">
        <div className="space-y-4 leading-relaxed">
          {settings?.about?.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/menu" className="btn-primary">Browse the menu</Link>
            <Link to="/contact" className="btn-outline">Visit us</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {gallery.slice(0, 4).map((img, i) => (
            <img key={img.id} src={img.image_url} alt={img.caption ?? ''} loading="lazy" className={`aspect-square w-full rounded-2xl object-cover shadow-sm ${i % 2 ? 'translate-y-6' : ''}`} />
          ))}
        </div>
      </div>
      {categories.length > 0 && (
        <section className="bg-cream-dark/60 py-14">
          <div className="container-page">
            <h2 className="mb-6 text-center text-2xl font-extrabold">What we make</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((c, i) => (
                <span key={c.id} className={`badge px-4 py-2 text-sm ${accent(i).soft} text-ink`}>
                  <span className={`mr-2 h-2 w-2 rounded-full ${accent(i).bg}`} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
