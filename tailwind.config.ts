import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        vn: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      colors: {
        primary: '#1e293b',
        accent: '#fbbf24',
        bg: '#18181b',
        text: '#f1f5f9',
      },
      animation: {
        fade: 'fadeIn 0.5s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
