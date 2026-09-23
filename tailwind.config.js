/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fruitsville brand palette (estimated from flyer + sticker artwork —
        // prefer official hex codes if brand guidelines are supplied later)
        maroon: {
          DEFAULT: '#6E1E42', // primary — nav, hero, primary buttons
          dark: '#4A1530', // footer, bottom contact bar
          light: '#F5E9EF',
        },
        red: {
          DEFAULT: '#D62839', // accent — CTAs, "Order now", badges
          dark: '#B01F2E',
          light: '#FCEAEC',
        },
        green: {
          DEFAULT: '#1B6B3C', // secondary accent — logo green, in-stock, secondary buttons
          dark: '#14532D',
          light: '#E7F3EC',
        },
        yellow: {
          DEFAULT: '#F4C430', // minor accent only — small tags/badges
        },
        charcoal: '#2A2A28',
        cream: '#FFFFFF',
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
