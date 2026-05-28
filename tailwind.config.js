/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crema: {
          50:  '#fdfaf5',
          100: '#f9f1e3',
          200: '#f1e3c7',
          300: '#e7d0a3',
          400: '#d9b87a',
        },
        verde: {
          50:  '#f3f7f2',
          100: '#e1ebdd',
          200: '#bfd3b8',
          300: '#94b58a',
          500: '#5a8a55',
          700: '#3d6239',
          900: '#22381f',
        },
        dorado: {
          400: '#d4a857',
          500: '#bf8f3c',
          600: '#a07528',
        },
        rosa: {
          100: '#fbeeea',
          200: '#f3d6cd',
          300: '#e6b3a4',
          500: '#c98473',
        },
        tinta: '#2a2622',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(60,40,20,0.18)',
      },
      animation: {
        'fade-up': 'fadeUp .7s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
