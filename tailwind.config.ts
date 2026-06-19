import type { Config } from 'tailwindcss';

/**
 * Colors map to CSS variables (see src/styles/tokens.css). The neon palette is
 * interpolated continuously by scroll progress (warm -> cold), so components
 * reference the vars instead of hardcoded values.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#08080b',
          800: '#0c0c11',
          700: '#101015',
          600: '#16161d',
        },
        neon: {
          1: 'rgb(var(--neon-1) / <alpha-value>)',
          2: 'rgb(var(--neon-2) / <alpha-value>)',
          3: 'rgb(var(--neon-3) / <alpha-value>)',
        },
        glass: 'rgb(var(--glass) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Clash Display"', 'Fraunces', 'serif'],
        sans: ['Satoshi', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgb(var(--neon-1) / 0.45), 0 0 64px rgb(var(--neon-2) / 0.25)',
        'glow-sm': '0 0 12px rgb(var(--neon-1) / 0.4)',
        'glow-lg': '0 0 48px rgb(var(--neon-1) / 0.6), 0 0 120px rgb(var(--neon-2) / 0.35)',
      },
      backdropBlur: { xs: '2px' },
      transitionTimingFunction: {
        land: 'cubic-bezier(0.16, 1, 0.3, 1)',
        camera: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        flicker: {
          '0%, 18%, 22%, 25%, 53%, 57%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        flicker: 'flicker 1.2s ease-in-out',
        breathe: 'breathe 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
