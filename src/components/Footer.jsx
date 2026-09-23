import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toWhatsAppNumber, whatsappLink } from '../lib/whatsapp'
import Logo from './Logo'
import SocialLinks from './SocialLinks'

export default function Footer() {
  const { settings } = useAuth()
  const year = new Date().getFullYear()
  const waLink = whatsappLink(settings)

  return (
    <footer className="bg-maroon-dark text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        {/* Logo grouped with name, address and socials, like the product sticker */}
        <div className="space-y-4">
          <Logo settings={settings} className="h-14 w-14" nameClassName="text-white" />
          {settings?.tagline && <p className="text-sm text-white/80">{settings.tagline}</p>}
          <SocialLinks settings={settings} className="text-white" />
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">Visit</h4>
          {settings?.address && <p className="text-sm leading-relaxed">{settings.address}</p>}
          {settings?.opening_hours && <p className="mt-2 text-sm text-white/80">{settings.opening_hours}</p>}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">Explore</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/menu" className="hover:underline">Menu</Link></li>
            <li><Link to="/gallery" className="hover:underline">Gallery</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
      </div>

      {/* "For more enquiries" contact strip */}
      {(settings?.phone || waLink) && (
        <div className="bg-black/20">
          <div className="container-page flex flex-col items-center justify-between gap-2 py-3 text-sm sm:flex-row">
            <span className="font-semibold uppercase tracking-wide">For more enquiries</span>
            <span className="flex flex-wrap items-center gap-4">
              {settings?.phone && (
                <a href={`tel:+${toWhatsAppNumber(settings.phone)}`} className="hover:underline">
                  Call {settings.phone}
                </a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  WhatsApp us
                </a>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/60 sm:flex-row">
        <span>© {year} {settings?.business_name}</span>
        <Link to="/admin" className="hover:text-white">Staff login</Link>
      </div>
    </footer>
  )
}
