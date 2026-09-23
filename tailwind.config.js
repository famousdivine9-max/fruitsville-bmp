/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fruitsville brand palette, sampled from the MR FRUITSVILLE product sticker
        brand: {
          DEFAULT: '#E30A0A', // primary — sticker red: nav, hero, primary buttons, headings
          dark: '#A8070A', // footer, contact strip, hover states
          light: '#FDECEC', // pale tint for section backgrounds
        },
        red: {
          DEFAULT: '#E30A0A', // alerts, destructive actions, small red flashes
          dark: '#B00808',
          light: '#FDECEC',
        },
        green: {
          DEFAULT: '#07773B', // accent — "PARFAIT" wordmark green: order/WhatsApp CTAs, in-stock
          dark: '#036535',
          light: '#E6F4EC',
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
