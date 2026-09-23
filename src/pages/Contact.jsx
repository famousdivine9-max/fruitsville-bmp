import PageHero from '../components/PageHero'
import SocialLinks from '../components/SocialLinks'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { useAuth } from '../context/AuthContext'
import { toWhatsAppNumber, whatsappLink } from '../lib/whatsapp'

function InfoCard({ icon, color, title, children }) {
  return (
    <div className="card flex gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${color}`}>{icon}</span>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  )
}

export default function Contact() {
  const { settings } = useAuth()
  const waLink = whatsappLink(settings, 'Hello, I have an enquiry.')
  const mapQuery = settings?.address ? encodeURIComponent(settings.address) : null

  return (
    <>
      <PageHero eyebrow="Contact" eyebrowClass="text-green" title="Come say hello" subtitle="Questions, bulk orders or events — reach out any time." photoIndex={3} />
      <div className="container-page grid gap-8 py-14 lg:grid-cols-2">
        <div className="space-y-4">
          {settings?.address && (
            <InfoCard icon="📍" color="bg-orange-light" title="Address">{settings.address}</InfoCard>
          )}
          {settings?.phone && (
            <InfoCard icon="📞" color="bg-green-light" title="Phone / WhatsApp">
              <a href={`tel:+${toWhatsAppNumber(settings.phone)}`} className="font-semibold text-ink hover:underline">{settings.phone}</a>
            </InfoCard>
          )}
          {settings?.email && (
            <InfoCard icon="✉️" color="bg-red-light" title="Email">
              <a href={`mailto:${settings.email}`} className="text-ink hover:underline">{settings.email}</a>
            </InfoCard>
          )}
          {settings?.opening_hours && (
            <InfoCard icon="🕒" color="bg-yellow-light" title="Opening hours">
              <span className="whitespace-pre-line">{settings.opening_hours}</span>
            </InfoCard>
          )}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-accent">
                <WhatsAppIcon /> Message us on WhatsApp
              </a>
            )}
            <SocialLinks settings={settings} className="text-ink" />
          </div>
        </div>
        {mapQuery && (
          <iframe
            title="Map"
            className="h-80 w-full rounded-2xl border-0 shadow-sm lg:h-full"
            loading="lazy"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          />
        )}
      </div>
    </>
  )
}
