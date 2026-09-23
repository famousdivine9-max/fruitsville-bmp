import SocialLinks from '../components/SocialLinks'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { useAuth } from '../context/AuthContext'
import { toWhatsAppNumber, whatsappLink } from '../lib/whatsapp'

export default function Contact() {
  const { settings } = useAuth()
  const waLink = whatsappLink(settings, 'Hello, I have an enquiry.')
  const mapQuery = settings?.address ? encodeURIComponent(settings.address) : null

  return (
    <>
      <section className="bg-gradient-to-br from-maroon to-maroon-dark py-12 text-white">
        <div className="container-page">
          <h1 className="text-4xl font-extrabold uppercase">Contact</h1>
          <p className="mt-2 text-white/80">Questions, bulk orders or events — reach out any time.</p>
        </div>
      </section>
      <div className="container-page grid gap-8 py-12 md:grid-cols-2">
        <div className="card space-y-5 p-6">
          {settings?.address && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-green">Address</h2>
              <p className="mt-1">{settings.address}</p>
            </div>
          )}
          {settings?.phone && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-green">Phone / WhatsApp</h2>
              <a href={`tel:+${toWhatsAppNumber(settings.phone)}`} className="mt-1 block font-semibold text-maroon hover:underline">
                {settings.phone}
              </a>
            </div>
          )}
          {settings?.email && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-green">Email</h2>
              <a href={`mailto:${settings.email}`} className="mt-1 block text-maroon hover:underline">{settings.email}</a>
            </div>
          )}
          {settings?.opening_hours && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-green">Opening hours</h2>
              <p className="mt-1 whitespace-pre-line">{settings.opening_hours}</p>
            </div>
          )}
          <SocialLinks settings={settings} className="text-maroon" />
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-accent">
              <WhatsAppIcon /> Message us on WhatsApp
            </a>
          )}
        </div>
        {mapQuery && (
          <iframe
            title="Map"
            className="h-80 w-full rounded-2xl border-0 md:h-full"
            loading="lazy"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          />
        )}
      </div>
    </>
  )
}
