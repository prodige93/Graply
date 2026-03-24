/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        glassDrop: {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'marquee-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.33%)' },
        },
        'marquee-right': {
          '0%': { transform: 'translateX(-33.33%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'glass-drop': 'glassDrop 0.18s cubic-bezier(0.22,1,0.36,1) forwards',
        'marquee-left': 'marquee-left 40s linear infinite',
        'marquee-right': 'marquee-right 40s linear infinite',
      },
    },
  },
  plugins: [],
};
