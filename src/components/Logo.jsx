export default function Logo({ settings, className = 'h-10 w-10', showName = true, nameClassName = '' }) {
  const name = settings?.display_name || settings?.business_name || ''
  return (
    <span className="flex items-center gap-2">
      {/* TODO: swap /public/logo.png for the real logo file once provided */}
      <img src="/logo.png" alt={`${settings?.business_name || 'Business'} logo`} className={`${className} rounded-full`} />
      {showName && name && (
        <span className={`font-display text-lg font-extrabold uppercase tracking-tight ${nameClassName}`}>
          {name}
        </span>
      )}
    </span>
  )
}
