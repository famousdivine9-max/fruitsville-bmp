const TONES = {
  error: 'bg-red-light text-red-dark border-red/30',
  success: 'bg-green-light text-green-dark border-green/30',
  info: 'bg-brand-light text-brand border-brand/20',
}

export default function Alert({ tone = 'info', children }) {
  if (!children) return null
  return <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${TONES[tone]}`}>{children}</div>
}
