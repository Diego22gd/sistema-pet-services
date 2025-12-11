/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        // Manteniendo tu paleta pero enriquecida para estilo Nextly
        primary: {
          DEFAULT: "#4CAF50", // Verde principal
          dark: "#388E3C",    // Verde oscuro
          light: "#81C784",   // Verde claro
          mint: "#34D399",    // Verde menta
        },
        secondary: {
          DEFAULT: "#3B82F6", // Azul
          dark: "#2563EB",    // Azul oscuro
          light: "#93C5FD",   // Azul claro
        },
        neutral: {
          light: "#F9FAFB",   // Fondo claro
          medium: "#9CA3AF",  // Texto medio
          dark: "#111827",    // Texto oscuro
          darkest: "#0A0F1C", // Texto más oscuro
          bg: "#F9FAFB",      // Fondo general
        },
        state: {
          success: "#10B981",
          warning: "#F97316",
          error: "#EF4444",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'hover': '0 20px 40px rgba(0, 0, 0, 0.12)',
        'lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}