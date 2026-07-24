/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f4ff',
          100: '#e9ebff',
          200: '#d4d9ff',
          300: '#b3bbff',
          400: '#8b9dff',
          500: '#6b7bf0',
          600: '#5960d4',
          700: '#4a4fab',
          800: '#3d4088',
          900: '#333a6e',
        },
        accent: {
          50: '#f0fbff',
          100: '#def4ff',
          200: '#b3e8ff',
          300: '#7dd6ff',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,157,255,0.25), 0 8px 30px rgba(107,123,240,0.35)',
        soft: '0 4px 24px rgba(60, 70, 120, 0.08)',
        'soft-lg': '0 12px 40px rgba(60, 70, 120, 0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6b7bf0 0%, #38bdf8 100%)',
        'lavender-gradient': 'linear-gradient(135deg, #e9ebff 0%, #def4ff 50%, #ffffff 100%)',
        'lavender-gradient-dark': 'linear-gradient(135deg, #1e2347 0%, #16243f 50%, #0f1830 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.2)', opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1)',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2,0.6,0.3,1) infinite',
      },
    },
  },
  plugins: [],
};
