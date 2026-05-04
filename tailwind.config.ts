import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#c9a84c',
        'gold-light': '#e0bd60',
        bg: '#0d0d0d',
        surface: '#111111',
        'surface-alt': '#161616',
        'surface-deep': '#080808',
        border: '#252525',
        'border-light': '#303030',
        'text-primary': '#e8e0d0',
        'text-muted': '#aaaaaa',
        'text-dim': '#777777',
        'text-faint': '#555555',
        'text-ghost': '#444444',
        correct: '#5cb85c',
        'correct-bright': '#7bde8c',
        wrong: '#c0392b',
        'wrong-bright': '#de8c7b',
        minor: '#7b8cde',
        'minor-dark': '#2d3561',
      },
      fontFamily: {
        sans: ['var(--font-mono)', 'monospace'],
        mono: ['var(--font-mono)', 'monospace'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
