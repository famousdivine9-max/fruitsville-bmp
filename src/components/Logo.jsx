export default function Logo({ settings, className = 'h-10 w-10', showName = true, nameClassName = '' }) {
  const name = settings?.display_name || settings?.business_name || ''
  return (
    <span className="flex items-center gap-2">
      {/* /public/logo.png is cut from the product sticker — swap in the original high-res logo file when available */}
      <img src="/logo.png" alt={`${settings?.business_name || 'Business'} logo`} className={`${className} rounded-full`} />
      {showName && name && (
        <span className={`font-display text-lg font-extrabold uppercase tracking-tight ${nameClassName}`}>
          {name}
        </span>
      )}
    </span>
  )
}
