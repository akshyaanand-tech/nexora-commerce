/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        nexora: {
          light: {
            bg: '#F8F9FB',
            card: '#FFFFFF',
            primary: '#111827',
            accent: '#2563EB',
            border: '#E5E7EB',
          },
          dark: {
            bg: '#0F172A',
            card: '#111827',
            primary: '#F9FAFB',
            accent: '#3B82F6',
            border: '#1F2937',
          },
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        lift: '0 8px 30px rgba(0,0,0,0.08)',
        'lift-dark': '0 8px 30px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
