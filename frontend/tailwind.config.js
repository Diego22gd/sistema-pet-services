/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}", // Ajusta según tu proyecto
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4CAF50", // Verde menta principal
          mint: "#34D399",
        },
        secondary: {
          DEFAULT: "#3B82F6", // Azul claro
          dark: "#2563EB",
        },
        neutral: {
          light: "#F3F4F6",
          medium: "#9CA3AF",
          dark: "#111827",
          bg: "#F9FAFB",
        },
        state: {
          success: "#10B981",
          warning: "#F97316",
          error: "#EF4444",
        },
      },
    },
  },
  plugins: [],
}
