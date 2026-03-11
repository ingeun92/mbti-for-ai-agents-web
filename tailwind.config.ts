import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 16personalities-inspired group colors
        analyst: {
          DEFAULT: '#88619A',
          light: '#F4EFF6',
          dark: '#6D4E7D',
        },
        diplomat: {
          DEFAULT: '#33A474',
          light: '#EDF8F2',
          dark: '#28836C',
        },
        sentinel: {
          DEFAULT: '#4298B4',
          light: '#EDF5F8',
          dark: '#357A93',
        },
        explorer: {
          DEFAULT: '#E4AE3A',
          light: '#FDF6E8',
          dark: '#C4932E',
        },
        // Base palette
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
        },
        body: {
          DEFAULT: '#2D2D2D',
          light: '#6B6B6B',
          muted: '#9E9E9E',
        },
      },
      fontFamily: {
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        body: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'scale-in': 'scale-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
