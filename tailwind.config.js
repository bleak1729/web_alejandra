/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {

        // ── Brand primario: escala teal ──────────────────────────────
        // Extraído de PaletaColores/package.html
        verde: {
          50:  '#eef5f3',  // tint de fondo, hover suave
          100: '#dcebe8',  // fondos de sección suaves
          200: '#a9cdc6',  // bordes, placeholders
          300: '#7fb6ad',  // íconos, decoración
          400: '#5aa49b',  // elementos secundarios activos
          500: '#3f8a82',  // CTA secundario, focus ring
          600: '#327069',  // hover del primary
          700: '#27595a',  // ← brand primary (botones, headers)
          800: '#1b3f40',  // footer, hero oscuro
          900: '#0e2422',  // texto sobre fondos claros, máxima densidad
        },

        // ── Neutros cálidos: fondos, texto, bordes ───────────────────
        crema: {
          50:  '#f6f4ef',  // fondo página
          100: '#ece8df',  // fondo alternado de sección
          200: '#ddd7ca',  // fondos de input
          300: '#c7bfae',  // bordes normales
          400: '#a79e8b',  // texto deshabilitado, placeholder
          500: '#857c6c',  // texto secundario
          600: '#665f52',  // texto muted con más peso
          700: '#4a443b',  // texto body oscuro
          800: '#322e28',  // headings dark
          900: '#1d1b17',  // tinta máxima (=tinta alias)
        },

        // ── Acento dorado / amber ─────────────────────────────────────
        dorado: {
          300: '#e8c070',
          400: '#d7a35a',  // ← diseño file principal
          500: '#bf8f3c',
          600: '#a07528',
        },

        // ── Acento terracota ──────────────────────────────────────────
        terracota: {
          100: '#fae8e2',
          200: '#f0c4b4',
          300: '#e09880',
          400: '#c2725a',  // ← diseño file principal
          500: '#a55840',
          600: '#8a4530',
        },

        // ── Acento salvia (verde grisáceo) ────────────────────────────
        salvia: {
          100: '#e8f0e0',
          200: '#ccdabf',
          300: '#b8c9a4',
          400: '#9aae84',  // ← diseño file principal
          500: '#7d9668',
          600: '#5f7450',
        },

        // ── Alias de texto principal ──────────────────────────────────
        tinta: '#1d1b17',
      },

      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },

      // Escala tipográfica editorial
      fontSize: {
        'display-2xl': ['3.625rem', { lineHeight: '1.04', letterSpacing: '-0.01em' }],
        'display-xl':  ['2.5rem',   { lineHeight: '1.08', letterSpacing: '-0.01em' }],
        'display-lg':  ['1.875rem', { lineHeight: '1.15' }],
        'display-md':  ['1.5rem',   { lineHeight: '1.2'  }],
      },

      letterSpacing: {
        label:  '0.06em',
        caps:   '0.12em',
        spaced: '0.18em',
      },

      boxShadow: {
        // Sombras con tinte de brand teal (39,89,90)
        soft:     '0 8px 30px -12px rgba(39,89,90,0.20)',
        card:     '0 14px 40px -24px rgba(39,89,90,0.55)',
        'card-lg':'0 24px 60px -28px rgba(39,89,90,0.50)',
        inner:    'inset 0 1px 3px rgba(29,43,41,0.08)',
        // Sombra overlay oscuro para modales
        modal:    '0 24px 60px -10px rgba(15,30,28,0.45)',
      },

      borderRadius: {
        pill: '999px',
      },

      animation: {
        'fade-up': 'fadeUp .7s ease both',
        'fade-in': 'fadeIn .5s ease both',
        'slide-in': 'slideIn .35s cubic-bezier(.25,.46,.45,.94) both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%':   { opacity: 0, transform: 'translateX(20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
