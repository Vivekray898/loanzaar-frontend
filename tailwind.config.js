/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F0FE',
          100: '#D0E1FD',
          200: '#A1C3FC',
          300: '#72A4FA',
          400: '#4385F7',
          500: '#1A73E8',
          600: '#1557C0',
          700: '#103B98',
          800: '#0B2470',
          900: '#061948',
        },
        secondary: {
          50: '#E8F2FE',
          100: '#D1E5FD',
          200: '#A3CBFB',
          300: '#74B1F9',
          400: '#4697F7',
          500: '#4A90E2',
          600: '#3B73B5',
          700: '#2C5688',
          800: '#1D395B',
          900: '#0E1C2E',
        },
        accent: {
          gold: '#FFC107',
          success: '#28A745',
          error: '#DC3545',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
      },
      animation: {
        slideInFromTop: 'slideInFromTop 0.3s ease-out',
        slideInFromRight: 'slideInFromRight 0.3s ease-out',
        fadeInUp: 'fadeInUp 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideInFromTop: {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInFromRight: {
          from: {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        fadeInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
