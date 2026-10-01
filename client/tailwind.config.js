/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rock: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        chalk: '#F7FAFC',
        carabiner: {
          DEFAULT: '#3182CE',
          dark: '#2B6CB0',
          light: '#EBF4FF',
        },
        send: {
          DEFAULT: '#38A169',
          dark: '#2F855A',
          light: '#F0FFF4',
        },
        pump: {
          DEFAULT: '#DD6B20',
          dark: '#C05621',
          light: '#FFFAF0',
        },
        fall: {
          DEFAULT: '#E53E3E',
          dark: '#C53030',
          light: '#FFF5F5',
        },
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'sheet-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'sheet-up': 'sheet-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
