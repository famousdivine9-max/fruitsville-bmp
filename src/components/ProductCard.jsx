import { useAuth } from '../context/AuthContext'
import { formatMoney } from '../lib/format'
import { productOrderMessage, whatsappLink } from '../lib/whatsapp'
import ProductImage from './ProductImage'
import WhatsAppIcon from './WhatsAppIcon'

export default function ProductCard({ product }) {
  const { settings } = useAuth()
  const link = whatsappLink(settings, productOrderMessage(product, settings))
  const hasPrice = Number(product.price) > 0

  return (
    <article className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <ProductImage product={product} />
        {/* Price tag sits on the photo */}
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-ink shadow-md">
          {hasPrice ? formatMoney(product.price, settings?.currency) : 'Ask for price'}
        </span>
        {product.is_featured && <span className="badge absolute left-3 top-3 bg-yellow text-ink">Popular</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-bold">{product.name}</h3>
        {product.description && <p className="text-sm">{product.description}</p>}
        <div className="mt-auto pt-2">
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn-accent btn-sm w-full">
              <WhatsAppIcon className="h-4 w-4" /> Order on WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
