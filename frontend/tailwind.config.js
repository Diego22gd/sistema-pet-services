/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
    extend: {
      colors: {
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        gray: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },

      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.06)',
        card: '0 20px 40px rgba(0,0,0,0.08)',
      },

      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('daisyui'),
  ],
   daisyui: {
    themes: ["light", "dark", "cupcake"], // temas que quieres usar
    darkTheme: "dark", // tema por defecto para modo oscuro
    base: true, // aplica estilos base
    styled: true, // incluye estilos de DaisyUI
    utils: true, // agrega clases utilitarias
    prefix: "", // prefijo para clases (útil si usas otros frameworks)
    logs: true, // muestra logs en consola
    themeRoot: ":root", // elemento raíz para las variables CSS
  },
}
