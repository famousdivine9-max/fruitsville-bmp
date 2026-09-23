// Normalises a stored phone/WhatsApp number to the international digits-only
// form wa.me expects. Nigerian local numbers (0XXXXXXXXXX) get the 234 country
// code in place of the leading 0: "0816 086 8528" → "2348160868528".
export function toWhatsAppNumber(raw, countryCode = '234') {
  let digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = countryCode + digits.slice(1)
  return digits
}

// Returns a wa.me link, or '' when no number is configured (callers hide the button).
export function whatsappLink(settings, message) {
  const number = toWhatsAppNumber(settings?.whatsapp || settings?.phone)
  if (!number) return ''
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${text}`
}

export function productOrderMessage(product, settings) {
  const shop = settings?.display_name || settings?.business_name || 'you'
  return `Hello ${shop}, I'd like to order: ${product.name}`
}
