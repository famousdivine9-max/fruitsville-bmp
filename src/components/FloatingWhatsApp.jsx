import { useAuth } from '../context/AuthContext'
import { whatsappLink } from '../lib/whatsapp'
import WhatsAppIcon from './WhatsAppIcon'

export default function FloatingWhatsApp() {
  const { settings } = useAuth()
  const shop = settings?.display_name || settings?.business_name
  const link = whatsappLink(settings, shop ? `Hello ${shop}, I'd like to place an order.` : undefined)
  if (!link) return null
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center sm:bottom-5 sm:right-5 sm:h-14 sm:w-14 justify-center rounded-full bg-green text-white shadow-lg transition hover:scale-105 hover:bg-green-dark"
    >
      <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  )
}
