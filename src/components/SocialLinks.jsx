const NETWORKS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
]

export default function SocialLinks({ settings, className = '' }) {
  const links = NETWORKS.filter((n) => settings?.[n.key])
  if (!links.length) return null
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((n) => (
        <li key={n.key}>
          <a
            href={settings[n.key]}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-current px-3 py-1 text-xs font-semibold hover:opacity-80"
          >
            {n.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
