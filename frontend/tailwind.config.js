/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
          400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
          800: '#9f1239', 900: '#881337', 950: '#4c0519'
        },
        mauve: { 50: '#fdf4ff', 100: '#fae8ff', 500: '#a855f7', 600: '#9333ea' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } }
      }
    }
  },
  plugins: []
}
