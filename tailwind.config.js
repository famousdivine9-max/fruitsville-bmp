/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Balanced palette: a warm neutral base with the logo's red, green, orange and
        // yellow shared evenly as accents — no single colour dominates the page.
        ink: {
          DEFAULT: '#1F1D1B', // headings, primary buttons, footer
          soft: '#57534E', // body text
          muted: '#8A847D', // captions
        },
        cream: {
          DEFAULT: '#FFFAF3', // page background
          dark: '#F6EDE0', // alternating section background
        },
        red: {
          DEFAULT: '#D7261E', // logo red — accents, destructive actions
          dark: '#A91C16',
          light: '#FDECEA',
        },
        green: {
          DEFAULT: '#1E8A44', // logo green — WhatsApp/order CTAs, in-stock
          dark: '#166A34',
          light: '#E7F5EC',
        },
        orange: {
          DEFAULT: '#EE8A1F', // logo orange — highlights, links
          dark: '#C46E10',
          light: '#FFF1E0',
        },
        yellow: {
          DEFAULT: '#F4C430', // small tags, star ratings
          light: '#FEF7DC',
        },
        charcoal: '#1F1D1B',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        kenburns: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.12)' } },
        fadein: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        marquee: 'marquee 45s linear infinite',
        kenburns: 'kenburns 9s ease-out forwards',
        fadein: 'fadein .6s ease-out both',
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
