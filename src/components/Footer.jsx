import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReviews } from '../lib/useReviews'
import { toWhatsAppNumber, whatsappLink } from '../lib/whatsapp'
import Logo from './Logo'
import SocialLinks from './SocialLinks'
import Stars from './Stars'

function Heading({ color, children }) {
  return (
    <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {children}
    </h4>
  )
}

export default function Footer() {
  const { settings } = useAuth()
  const { reviews, average } = useReviews()
  const year = new Date().getFullYear()
  const waLink = whatsappLink(settings)
  const latest = reviews[0]
  const mapLink = settings?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
    : null

  return (
    <footer className="bg-ink text-white/75">
      {/* Four-colour stripe from the logo */}
      <div className="grid h-1.5 grid-cols-4">
        <span className="bg-red" /><span className="bg-green" /><span className="bg-orange" /><span className="bg-yellow" />
      </div>

      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Heading color="bg-red">About us</Heading>
          <div className="mb-3">
            <Logo settings={settings} className="h-12 w-12" nameClassName="text-white text-base" />
          </div>
          {settings?.tagline && <p className="text-sm leading-relaxed">{settings.tagline}</p>}
          <Link to="/about" className="mt-3 inline-block text-sm font-semibold text-orange hover:underline">Our story →</Link>
        </div>

        <div>
          <Heading color="bg-green">Contact</Heading>
          <ul className="space-y-2 text-sm">
            {settings?.phone && (
              <li><a href={`tel:+${toWhatsAppNumber(settings.phone)}`} className="hover:text-white">📞 {settings.phone}</a></li>
            )}
            {waLink && (
              <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">💬 Chat on WhatsApp</a></li>
            )}
            {settings?.email && (
              <li><a href={`mailto:${settings.email}`} className="hover:text-white">✉️ {settings.email}</a></li>
            )}
          </ul>
          <SocialLinks settings={settings} className="mt-4 text-white/80" />
        </div>

        <div>
          <Heading color="bg-orange">Address</Heading>
          {settings?.address && <p className="text-sm leading-relaxed">{settings.address}</p>}
          {settings?.opening_hours && <p className="mt-2 whitespace-pre-line text-sm">{settings.opening_hours}</p>}
          {mapLink && (
            <a href={mapLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-orange hover:underline">
              Get directions →
            </a>
          )}
        </div>

        <div>
          <Heading color="bg-yellow">Reviews</Heading>
          {reviews.length ? (
            <>
              <div className="flex items-center gap-2">
                <Stars value={average} />
                <span className="text-sm text-white">{average.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
              </div>
              <blockquote className="mt-3 text-sm italic leading-relaxed">
                “{latest.comment.length > 120 ? `${latest.comment.slice(0, 120)}…` : latest.comment}”
                <span className="mt-1 block not-italic text-white/50">— {latest.name}</span>
              </blockquote>
            </>
          ) : (
            <p className="text-sm">Tried our food? We&apos;d love to hear from you.</p>
          )}
          <Link to="/reviews" className="mt-3 inline-block text-sm font-semibold text-orange hover:underline">
            {reviews.length ? 'Read all & leave a review →' : 'Leave a review →'}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <span>© {year} {settings?.business_name}. All rights reserved.</span>
          <nav className="flex gap-4">
            <Link to="/menu" className="hover:text-white">Menu</Link>
            <Link to="/gallery" className="hover:text-white">Gallery</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
