export default function SectionTitle({ eyebrow, eyebrowClass = 'text-orange', title, subtitle, center = false }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow ${eyebrowClass}`}>{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {subtitle && <p className={`mt-3 max-w-2xl ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </div>
  )
}
