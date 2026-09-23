// Accent colours rotate through the logo palette so no single colour dominates.
// Full class strings are listed so Tailwind keeps them in the build.
export const ACCENTS = [
  { text: 'text-red', bg: 'bg-red', soft: 'bg-red-light', border: 'border-red', top: 'border-t-red', left: 'border-l-red' },
  { text: 'text-green', bg: 'bg-green', soft: 'bg-green-light', border: 'border-green', top: 'border-t-green', left: 'border-l-green' },
  { text: 'text-orange', bg: 'bg-orange', soft: 'bg-orange-light', border: 'border-orange', top: 'border-t-orange', left: 'border-l-orange' },
  { text: 'text-yellow', bg: 'bg-yellow', soft: 'bg-yellow-light', border: 'border-yellow', top: 'border-t-yellow', left: 'border-l-yellow' },
]

export const accent = (i) => ACCENTS[((i % ACCENTS.length) + ACCENTS.length) % ACCENTS.length]
