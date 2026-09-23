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
    <article className="card flex flex-col overflow-hidden">
      <div className="relative">
        <ProductImage product={product} />
        {product.is_featured && (
          <span className="badge absolute left-3 top-3 bg-yellow text-charcoal">Popular</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-charcoal">{product.name}</h3>
          {hasPrice && (
            <span className="whitespace-nowrap font-semibold text-brand">
              {formatMoney(product.price, settings?.currency)}
            </span>
          )}
        </div>
        {product.description && <p className="text-sm text-gray-600">{product.description}</p>}
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
